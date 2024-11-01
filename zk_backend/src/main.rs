// These constants represent the RISC-V ELF and the image ID generated by risc0-build.
// The ELF is used for proving and the ID is used for verification.
use aligned_sdk::core::errors::SubmitError;
use aligned_sdk::core::types::Network;
use aligned_sdk::core::types::{ProvingSystemId, VerificationData};
use aligned_sdk::sdk::{get_next_nonce, submit_and_wait_verification};
use std::path::PathBuf;

use axum::{http::StatusCode, response::IntoResponse, routing::post, Json, Router};
use ethers::signers::{LocalWallet, Signer};
use ethers::types::{Address, U256};
use methods::{HELLO_GUEST_ELF, HELLO_GUEST_ID};
use ndarray::Array2;
use ndarray_rand::RandomExt;
use nonogram::Clue;
use rand::distributions::Uniform;
use risc0_zkvm::{default_prover, ExecutorEnv, InnerReceipt};
use serde::{Deserialize, Serialize};
use tower_http::cors::CorsLayer;

const PROOF_FILE_PATH: &str = "risc_zero_fibonacci.proof";
const PUB_INPUT_FILE_PATH: &str = "risc_zero_fibonacci.pub";
const IMAGE_ID_FILE_PATH: &str = "risc_zero_fibonacci_id.bin";

const BATCHER_URL: &str = "wss://batcher.alignedlayer.com";
const RPC_URL: &str = "https://ethereum-holesky-rpc.publicnode.com";
const PROOF_GENERATOR_ADDRESS: &str = "0x66f9664f97F2b50F62D13eA064982f936dE76657";
const NETWORK: Network = Network::Holesky;

#[derive(Debug, Serialize, Deserialize)]
struct ProofGameDTO {
    input_game: Array2<u8>,
    desired_clue: Clue,
}

#[derive(Debug, Serialize, Deserialize)]
struct ProofResponseDTO {
    proof: Vec<u8>,
    elf: [u8; 32],
    public: Vec<u8>,
}

enum MyResult<T, E> {
    Ok(T),
    Err(E),
}

impl<E: Serialize + IntoResponse> IntoResponse for MyResult<ProofResponseDTO, E> {
    fn into_response(self) -> axum::response::Response {
        match self {
            MyResult::Ok(data) => {
                if let Ok(json) = serde_json::to_string(&data) {
                    return (StatusCode::CREATED, json).into_response();
                }

                return (StatusCode::BAD_REQUEST, "error").into_response();
            }
            MyResult::Err(e) => {
                return (StatusCode::BAD_REQUEST, e).into_response();
            }
        }
    }
}

use std::time::Duration;

use anyhow::Result;
use bonsai_sdk::non_blocking::Client;
use risc0_zkvm::{compute_image_id, serde::to_vec, Receipt};

async fn run_bonsai(input_data: Vec<u8>) -> Result<()> {
    let client = Client::from_env(risc0_zkvm::VERSION)?;

    // Compute the image_id, then upload the ELF with the image_id as its key.
    let image_id = hex::encode(compute_image_id(HELLO_GUEST_ELF)?);
    client
        .upload_img(&image_id, HELLO_GUEST_ELF.to_vec())
        .await?;

    // Prepare input data and upload it.
    let input_data = to_vec(&input_data).unwrap();
    let input_data = bytemuck::cast_slice(&input_data).to_vec();
    let input_id = client.upload_input(input_data).await?;

    // Add a list of assumptions
    let assumptions: Vec<String> = vec![];

    // Wether to run in execute only mode
    let execute_only = false;

    // Start a session running the prover
    let session = client
        .create_session(image_id, input_id, assumptions, execute_only)
        .await?;
    loop {
        let res = session.status(&client).await?;
        if res.status == "RUNNING" {
            eprintln!(
                "Current status: {} - state: {} - continue polling...",
                res.status,
                res.state.unwrap_or_default()
            );
            std::thread::sleep(Duration::from_secs(15));
            continue;
        }
        if res.status == "SUCCEEDED" {
            // Download the receipt, containing the output
            let receipt_url = res
                .receipt_url
                .expect("API error, missing receipt on completed session");

            let receipt_buf = client.download(&receipt_url).await?;
            let receipt: Receipt = bincode::deserialize(&receipt_buf)?;
            receipt
                .verify(HELLO_GUEST_ID)
                .expect("Receipt verification failed");

            let serialized = bincode::serialize(&receipt.inner).unwrap();

            std::fs::write(PROOF_FILE_PATH, serialized).expect("Failed to write proof file");

            std::fs::write(IMAGE_ID_FILE_PATH, convert(&HELLO_GUEST_ID))
                .expect("Failed to write fibonacci_id file");

            std::fs::write(PUB_INPUT_FILE_PATH, receipt.journal.bytes)
                .expect("Failed to write pub_input file");

            break;
        } else {
            panic!(
                "Workflow exited: {} - | err: {}",
                res.status,
                res.error_msg.unwrap_or_default()
            );
        }

        // Optionally run stark2snark
        // run_stark2snark(session.uuid)?;
    }

    send_proof().await;

    Ok(())
}

#[axum::debug_handler]
async fn create_proof_of_game(Json(input): Json<ProofGameDTO>) -> impl IntoResponse {
    let env = ExecutorEnv::builder()
        .write(&input.input_game)
        .unwrap()
        .build()
        .unwrap();

    let prover = default_prover();

    let receipt = prover.prove(env, HELLO_GUEST_ELF).unwrap().receipt;

    let output: Clue = receipt.journal.decode().unwrap();

    println!("{:?}", output);

    if output != input.desired_clue {
        return MyResult::Err("error");
    }

    let res = receipt.verify(HELLO_GUEST_ID);

    if res.is_err() {
        return MyResult::Err("error");
    }

    let serialized = bincode::serialize(&receipt.inner).unwrap();

    std::fs::write(PROOF_FILE_PATH, serialized).expect("Failed to write proof file");

    std::fs::write(IMAGE_ID_FILE_PATH, convert(&HELLO_GUEST_ID))
        .expect("Failed to write fibonacci_id file");

    std::fs::write(PUB_INPUT_FILE_PATH, receipt.journal.bytes)
        .expect("Failed to write pub_input file");

    println!("done write");
    tokio::spawn(async move { send_proof().await });

    return MyResult::Err("err");
}

async fn send_proof() {
    println!("started read");
    let proof_generator_addr: Address = PROOF_GENERATOR_ADDRESS.parse().unwrap();

    let proof = read_file(PathBuf::from(PROOF_FILE_PATH)).unwrap_or_default();

    let pub_input = read_file(PathBuf::from(PUB_INPUT_FILE_PATH));

    let image_id = read_file(PathBuf::from(IMAGE_ID_FILE_PATH));

    println!("image : {:?}", image_id);
    println!("input : {:?}", pub_input);

    let verification_data = VerificationData {
        proving_system: ProvingSystemId::Risc0,
        proof,
        pub_input,
        verification_key: None,
        vm_program_code: image_id,
        proof_generator_addr,
    };

    // Set a fee of 0.1 Eth
    let max_fee = U256::from(5) * U256::from(100_000_000_000_000_000u128);

    //free to use private key approximitly there are 1.4 eth in holesky we can use it together
    //please dont steal lets use together
    let wallet: LocalWallet = "9064e48a57597d4e9e95295eb43e7fb9f41738c24b3cce68ae7c676ff326e5a1"
        .parse::<LocalWallet>()
        .unwrap()
        .with_chain_id(17000u64);

    let nonce = get_next_nonce(RPC_URL, wallet.address(), NETWORK)
        .await
        .expect("Failed to get next nonce");

    let aligned_verification_data = submit_and_wait_verification(
        BATCHER_URL,
        RPC_URL,
        NETWORK,
        &verification_data,
        max_fee,
        wallet,
        nonce,
    )
    .await;

    println!("{:#?}", aligned_verification_data);
}

#[derive(Debug, Serialize, Deserialize)]
struct CreateGameDTO {
    rows: usize,
    columns: usize,
}

#[derive(Debug, Serialize, Deserialize)]
struct GameResponseDTO {
    grid: Array2<u8>,
    clues: Clue,
}

async fn create_game(Json(input): Json<CreateGameDTO>) -> impl IntoResponse {
    let input = Array2::random((input.rows, input.columns), Uniform::new_inclusive(0, 1));
    let nonogram = Clue::generate_clues(input.clone());
    let response = GameResponseDTO {
        grid: input,
        clues: nonogram,
    };
    let data = serde_json::to_string(&response);
    if data.is_err() {
        return "error".to_string();
    }
    return data.unwrap();
}

#[tokio::main]
async fn main() {
    // build our application with a single route
    let app = Router::new()
        .route("/create_proof", post(create_proof_of_game))
        .route("/create_game", post(create_game))
        .layer(CorsLayer::permissive());

    // run our app with hyper, listening globally on port 3000
    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

pub fn convert(data: &[u32; 8]) -> [u8; 32] {
    let mut res = [0; 32];
    for i in 0..8 {
        res[4 * i..4 * (i + 1)].copy_from_slice(&data[i].to_le_bytes());
    }
    res
}

fn read_file(file_name: PathBuf) -> Option<Vec<u8>> {
    std::fs::read(file_name).ok()
}

// If you want to try std support, also update the guest Cargo.toml file

use risc0_zkvm::guest::env;

fn main() {
    let n: Array<2> = env::read::<u32>();

    let clue = Clue::generate_clues(n)

    env::commit(&clue);
}

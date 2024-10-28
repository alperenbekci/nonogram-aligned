"use client";

// src/hooks/useWallet.ts
import { useState } from "react";
import { ethers } from "ethers"; // Ethers.js kütüphanesini içe aktar

// Extend the Window interface to include the ethereum property
declare global {
  interface Window {
    ethereum?: any;
  }
}

// Cüzdan bağlantısını yöneten özel hook
export const useWallet = () => {
  const [account, setAccount] = useState<string | null>(null); // Bağlı hesabı tutan durum

  // Cüzdan bağlantı fonksiyonu
  const connectWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts", // Cüzdan hesaplarını iste
        });
        setAccount(accounts[0]); // İlk hesabı duruma ayarla
      } catch (error) {
        console.error("Error connecting to wallet:", error); // Hata durumunu konsola yaz
      }
    } else {
      alert("Please install MetaMask!"); // MetaMask kurulu değilse uyarı ver
    }
  };

  return { account, connectWallet }; // Hesap ve bağlantı fonksiyonunu döndür
};

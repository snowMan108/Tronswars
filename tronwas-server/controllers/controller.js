const bufferToArrayBuffer = require("buffer-to-arraybuffer");
const { ethers } = require("ethers");
var fs = require('fs');
const path = require("path");
const fetch = (...args) =>
  import('node-fetch').then(({ default: fetch }) => fetch(...args));
const glbOfTokenId = {}
var array = fs.readFileSync(path.join(__dirname, '../map.csv')).toString().split("\n");
for (i in array) {
  const line = array[i]
  const splitted = line.split(';')
  const tokenId = splitted[0].trim()
  const glbId = splitted[1].trim()
  glbOfTokenId[tokenId] = glbId
}

exports.getFile = async (req, res) => {
  const { message, signature, address } = req.query;
  if (!message && !signature && !address) {
    return res.status(501).send({
      message: 'Bad request'
    })
  }
  const isValid = verifyMessage({
    message,
    address,
    signature
  });
  if (isValid) {
    const { tokenId } = JSON.parse(message)
    const API_KEY = process.env.API_KEY
    fetch(
      `https://api.nftport.xyz/v0/accounts/${address}?contract_address=0x537b2279d8f625a1b74cf3c1f0e2122fb047a6b0&chain=ethereum&include=metadata&page_size=${50}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: API_KEY,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.nfts) {
          const index = data.nfts.find(item => item.token_id === tokenId)
          if (index === -1) {
            return res.status(404).json({
              message: "You don't have this token Id"
            })
          }
          const glbId = glbOfTokenId[tokenId]
          const glbBase64 = fs.readFileSync(path.join(__dirname, `../models/${glbId}.glb`), { encoding: 'base64' });
          return res.status(200).json({
            status: 'success',
            data: glbBase64,
          })
        }
        else return res.status(404).json({
          message: "You don't have this token Id"
        })
      })
      .catch((e) => {
        console.log(e);
        return res.status(501).json({
          message: e.message ?? "Something went wrong"
        })
      });
  }
  else res.status(501).json({
    message: 'signature is invalid'
  })
};

exports.getMaterial = (req, res) => {
  const { message, signature, address } = req.body;
  if (!message && !signature && !address) {
    return res.status(501).send({
      message: 'Bad request'
    })
  }
  const isValid = verifyMessage({
    message,
    address,
    signature
  });
  if (isValid) {
    const { tokenId } = JSON.parse(message)
    const API_KEY = process.env.API_KEY
    fetch(
      `https://api.nftport.xyz/v0/accounts/${address}?contract_address=0x537b2279d8f625a1b74cf3c1f0e2122fb047a6b0&chain=ethereum&include=metadata&page_size=${50}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: API_KEY,
        },
      }
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.nfts) {
          const index = data.nfts.find(item => item.token_id === tokenId)
          if (index === -1) {
            return res.status(404).json({
              message: "You don't have this token Id"
            })
          }
          const glbBase64 = fs.readFileSync(path.join(__dirname, `../models/material.blend`), { encoding: 'base64' });
          return res.status(200).json({
            status: 'success',
            data: glbBase64,
          })
        }
        else return res.status(404).json({
          message: "You don't have this token Id"
        })
      })
      .catch((e) => {
        console.log(e);
        return res.status(501).json({
          message: e.message ?? "Something went wrong"
        })
      });
  }
  else res.status(501).json({
    message: 'signature is invalid'
  })
}

const verifyMessage = ({ message, address, signature }) => {
  try {
    const signerAddr = ethers.utils.verifyMessage(message, signature);
    if (signerAddr !== address) {
      return false;
    }

    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};
const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16 } = require("snarkjs");
const { plonk } = require("snarkjs");

function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return BigInt(o);
    } else if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o) ))  {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        if (o===null) return null;
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

describe("HelloWorld", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("HelloWorldVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing
        //creating proof and witness
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2"}, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm","contracts/circuits/HelloWorld/circuit_final.zkey");
        //writing log of publicSignals(output)
        console.log('1x2 =',publicSignals[0]);
        //Converts witness from json to bigint(add ).
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        //Converts proof from json to bigint.
        const editedProof = unstringifyBigInts(proof);
        //converts to hexadecimal character string
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
        //making arrangement of stringfied bigint calldata
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
       // console.log("argv",argv);
        // split argv to a,b,c,Input
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);
        console.log("Input",Input);
        //calling  function verifyProof from HelloWorld.sol
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with Groth16", function () {
    let Verifier;
    let verifier;
    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("Multiplier3Verifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        //creating proof and witness
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2", "c":"3"}, "contracts/circuits/Multiplier3-groth16/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3-groth16/circuit_final.zkey");
        //writing log of publicSignals(output)
        console.log('1x2x3 =',publicSignals[0]);
        //Converts witness from json to bigint(add ).
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        //Converts proof from json to bigint.
        const editedProof = unstringifyBigInts(proof);
        //converts to hexadecimal character string
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
        //making arrangement of stringfied bigint calldata
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
       // console.log("argv",argv);
        // split argv to a,b,c,Input
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);
       // console.log("Input",Input);
        //calling  function verifyProof from HelloWorld.sol
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;

    });
});


describe("Multiplier3 with PLONK", function () {
    let Verifier;
    let verifier;
    beforeEach(async function () {
        //[assignment] insert your script here
         Verifier = await ethers.getContractFactory("PlonkVerifier");
         verifier = await Verifier.deploy();
         await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
        //creating proof and witness
        const { proof, publicSignals } = await plonk.fullProve({"a":"1","b":"2", "c":"3"}, "contracts/circuits/Multiplier3-plonk/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3-plonk/circuit_final.zkey");
      //  console.log("proof__pl",proof);
        //writing log of publicSignals(output)
        console.log('1x2x3 =',publicSignals[0]);
        //Converts witness from json to bigint(add ).
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        //Converts proof from json to bigint.
        const editedProof = unstringifyBigInts(proof);
        //converts to hexadecimal character string
        const calldata = await plonk.exportSolidityCallData(editedProof, editedPublicSignals);
        //console.log("calldata_plonk",calldata);
        //making arrangement of stringfied bigint calldata
        const argv = calldata.replace(/["[\]\s]/g, "").split(',');
        // split argv to a,b,c,Input
        const Input = BigInt(argv[1]);
        // console.log("argv",argv[0]);
        // console.log("Input",Input);
        //calling  function verifyProof from HelloWorld.sol
        expect(await verifier.verifyProof(argv[0],[Input])).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        
        expect(await verifier.verifyProof('0x',[0])).to.be.false;
    });
});
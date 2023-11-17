import * as assert from 'assert';

import { CompilePlan, CompileResult, RunningPlan, RunningResult, ProblemData } from '../../types';
import * as binary from '../../binary';
import * as problem from '../../problem';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import path from "path";
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});
});

// binary.ts
// TODO: Fix this for other OSes than Windows
suite('Binary Manager Test Suite', () => {
	test('Compile C', () => {
		const plan: CompilePlan = {
			language: "c",
			srcPath: path.join(__dirname,"adder.c"),
			binPath: path.join(__dirname,"adder.exe"),
		};
		return binary.compileSrc(plan).then((result: CompileResult) => {
			assert.strictEqual(result.status, "OK", 'Compilation failure.');
			assert.strictEqual(result.binPath, path.join(__dirname,"adder.exe"), 'binary file is not produced.');
		}).catch((e)=>{
			throw Error(e);
		});
	});
	
	test('Compile C(2)', () => {
		const plan: CompilePlan = {
			language: "c",
			srcPath: path.join(__dirname,"infloop.c"),
			binPath: path.join(__dirname,"infloop.exe"),
		};
		return binary.compileSrc(plan).then((result: CompileResult) => {
			assert.strictEqual(result.status, "OK", 'Compilation failure.');
			assert.strictEqual(result.binPath, path.join(__dirname,"infloop.exe"), 'binary file is not produced.');
		}).catch((e)=>{
			throw Error(e);
		});
	});
	
	test('Compile C with error', () => {
		const plan: CompilePlan = {
			language: "c",
			srcPath: path.join(__dirname,"wrong.c"),
			binPath: path.join(__dirname,"wrong.exe"),
		};
		return binary.compileSrc(plan).then((result: CompileResult) => {
			assert.strictEqual(result.status, "CE", 'Compilation has to fail, but succeded.');
			// TODO: Is there any way to check the error message without depending on the compiler?
			// if(!result.stderr?.includes(`expected ‘;’ before ‘}’ token`)){
			// 	throw Error(`Compilation failed with another reason : ${result.stderr}`);
			// }
		}).catch((e)=>{
			throw Error(e);
		});
	});

	test('Run successful binary', () => {
		const plan: RunningPlan = {
			binPath: path.join(__dirname,"adder.exe"),
			stdin: "1 2\n",
			timeLimit: 1000
		};
		
		return binary.runBin(plan).then((result: RunningResult) => {
			assert.strictEqual(result.status, "OK", `exit status must be OK, result=${JSON.stringify(result)}`);
			assert.strictEqual(result.stdout, "3\r\n", `stdout is incorrect. result=${JSON.stringify(result)}`);
			assert.strictEqual(result.stderr, "", `stderr is incorrect. result=${JSON.stringify(result)}`);
		}).catch((e)=>{
			throw Error(e);
		});
	});

	test('Run timeout binary', () => {
		const plan: RunningPlan = {
			binPath: path.join(__dirname,"infloop.exe"),
			stdin: "",
			timeLimit: 1000
		};
		
		return binary.runBin(plan).then((result: RunningResult) => {
			assert.strictEqual(result.status, "TIMEOUT", `exit status must be TIMEOUT, result=${JSON.stringify(result)}`);
			assert.strictEqual(result.stdout, "", `stdout is incorrect. result=${JSON.stringify(result)}`);
			assert.strictEqual(result.stderr, "", `stderr is incorrect. result=${JSON.stringify(result)}`);
		}).catch((e)=>{
			throw Error(e);
		});
	});

	test('Run kill binary', () => {
		const plan: RunningPlan = {
			binPath: path.join(__dirname,"infloop.exe"),
			stdin: "",
			timeLimit: 1000
		};

		const bin = binary.runBin(plan);
		binary.terminateAll();
		
		return bin.then((result: RunningResult) => {
			assert.strictEqual(result.status, "KILLED", `exit status must be KILLED, result=${JSON.stringify(result)}`);
			assert.strictEqual(result.stdout, "", `stdout is incorrect. result=${JSON.stringify(result)}`);
			assert.strictEqual(result.stderr, "", `stderr is incorrect. result=${JSON.stringify(result)}`);
		}).catch((e)=>{
			throw Error(e);
		});
	});
});

// problem.ts
suite('Problem manager test', () => {
	test('Read metadata', () => {
		return problem.searchProblemData(__dirname,'samplepath.c').then((metadata:ProblemData)=>{
			assert.deepStrictEqual(metadata,{id:"20c506a8-8555-11ee-b9d1-0242ac120002",name:"Read problem",url:"https://example.com",description:"Simple Read problem. You have to read this metadata file for ensuring the PSCode project's prosperity. Checking the validity of the metadata is out of range for this problem.",testcases:[{input:"testcase input 1",output:"testcase output 1"},{input:"testcase input 2",output:"testcase output 2"}],srcPath:"samplepath.c",binPath:"samplepath.exe"});
		}
		);
	});
});

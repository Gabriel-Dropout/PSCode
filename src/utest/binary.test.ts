import * as assert from 'assert';

import { CompilePlan, CompileResult, RunningPlan, RunningResult, ProblemData } from '../types';
import * as binary from '../binary';

import path from "path";

// binary.ts
// TODO: Fix this for other OSes than Windows
suite('Binary Manager Test Suite', () => {
	test('Compile C', () => {
		const plan: CompilePlan = {
			language: "c",
			srcPath: path.join(__dirname,"files/adder.c"),
			binPath: path.join(__dirname,"files/adder.exe"),
		};
		return binary.compileSrc(plan).then((result: CompileResult) => {
			assert.strictEqual(result.status, "OK", 'Compilation failure.');
			assert.strictEqual(result.binPath, plan.binPath, 'binary file is not produced.');
		}).catch((e)=>{
			throw Error(e);
		});
	});
	
	test('Compile C(2)', () => {
		const plan: CompilePlan = {
			language: "c",
			srcPath: path.join(__dirname,"files/infloop.c"),
			binPath: path.join(__dirname,"files/infloop.exe"),
		};
		return binary.compileSrc(plan).then((result: CompileResult) => {
			assert.strictEqual(result.status, "OK", 'Compilation failure.');
			assert.strictEqual(result.binPath, plan.binPath, 'binary file is not produced.');
		}).catch((e)=>{
			throw Error(e);
		});
	});
	
	test('Compile C with error', () => {
		const plan: CompilePlan = {
			language: "c",
			srcPath: path.join(__dirname,"files/wrong.c"),
			binPath: path.join(__dirname,"files/wrong.exe"),
		};
		return binary.compileSrc(plan).then((result: CompileResult) => {
			assert.strictEqual(result.status, "CE", 'Compilation has to fail, but succeded.');
		}).catch((e)=>{
			throw Error(e);
		});
	});

	test('Run successful binary', () => {
		const plan: RunningPlan = {
			binPath: path.join(__dirname,"files/adder.exe"),
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
			binPath: path.join(__dirname,"files/infloop.exe"),
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
			binPath: path.join(__dirname,"files/infloop.exe"),
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
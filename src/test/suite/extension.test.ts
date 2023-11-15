import * as assert from 'assert';

import { CompilePlan, CompileResult, RunningPlan, RunningResult } from '../../types';
import * as binary from '../../binary';

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
			assert.strictEqual(result.status, 0, 'Compilation failure.');
			assert.strictEqual(result.binPath, path.join(__dirname,"adder.exe"), 'binary file is not produced.');
			
		}).catch((e)=>{
			throw Error(e);
		});
	});

	test('Run binary', () => {
		const plan: RunningPlan = {
			binPath: path.join(__dirname,"adder.exe"),
			stdin: "1 2\n",
			timeLimit: 1000
		};
		
		return binary.runBin(plan).then((result: RunningResult) => {
			assert.strictEqual(result.timeOut, false, "timeout occured.");
			assert.strictEqual(result.status, 0, `exit status is not 0, result=${JSON.stringify(result)}`);
			assert.strictEqual(result.stdout, "3\n", "stdout is incorrect.");
			assert.strictEqual(result.stderr, "", "stderr is incorrect.");
		}).catch((e)=>{
			throw Error(e);
		});
	});
});
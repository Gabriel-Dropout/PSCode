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
	test('Compile C', (done) => {
		const plan: CompilePlan = {
			language: "c",
			srcPath: path.join(__dirname,"adder.c"),
			binPath: path.join(__dirname,"adder.exe"),
		};
		binary.compileSrc(plan).then((result: CompileResult) => {
			assert.strictEqual(result.status, 0);
			assert.strictEqual(result.binPath, path.join(__dirname,"adder.exe"));
			done();
		}).catch((result) => {
			assert.fail(JSON.stringify(result));
		});
	});

	test('Run binary', (done) => {
		const plan: RunningPlan = {
			binPath: path.join(__dirname,"adder.exe"),
			stdin: "1 2\n",
			timeLimit: 1000
		};
		
		binary.runBin(plan).then((result: RunningResult) => {
			assert.strictEqual(result.timeOut, false, "timeout occured.");
			assert.strictEqual(result.status, 0, `exit status is not 0, result=${JSON.stringify(result)}`);
			assert.strictEqual(result.stdout, "3\n", "stdout is incorrect.");
			assert.strictEqual(result.stderr, "", "stderr is incorrect.");
			done();
		}).catch((result) => {
			assert.fail(`error : result=${JSON.stringify(result)}`);
		});
	});
});
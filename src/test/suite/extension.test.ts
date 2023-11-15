import * as assert from 'assert';

import { CompilePlan, CompileResult, RunningPlan, RunningResult } from '../../types';
import * as binary from '../../binary';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
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
			srcPath: "adder.c",
			binPath: "adder"
		};
		binary.compileSrc(plan).then((result: CompileResult) => {
			assert.strictEqual(result.status, 0);
			assert.strictEqual(result.binPath, "adder");
		}).catch((result) => {
			assert.fail(result);
		});
	});

	test('Run binary', () => {
		const plan: RunningPlan = {
			binPath: "adder.exe",
			stdin: "1 2",
			timeLimit: 1
		};
		
		binary.runBin(plan).then((result: RunningResult) => {
			assert.strictEqual(result.status, 0);
			assert.strictEqual(result.stdout, "3\n");
			assert.strictEqual(result.stderr, "");
			assert.strictEqual(result.timeOut, false);
		}).catch((result) => {
			assert.fail(result);
		});
	});
});
import * as assert from 'assert';

import { CompilePlan, CompileResult, RunningPlan, RunningResult, ProblemData } from '../types';
import * as problem from '../problem';

import * as fs from 'fs';
import path from "path";

// problem.ts
suite('Problem manager test', () => {
	test('Read metadata', () => {
		return problem.searchProblemData(path.join(__dirname,"files"),'samplepath.c').then((metadata:ProblemData | null) => {
			// assert metadata is not null
			assert.notStrictEqual(metadata, null);
			assert.deepStrictEqual(metadata, {id:"20c506a8-8555-11ee-b9d1-0242ac120002",name:"Read problem",url:"https://example.com",description:"Simple Read problem. You have to read this metadata file for ensuring the PSCode project's prosperity. Checking the validity of the metadata is out of range for this problem.",testcases:[{input:"testcase input 1",output:"testcase output 1"},{input:"testcase input 2",output:"testcase output 2"}],srcPath:"samplepath.c",binPath:"samplepath.exe"});
		});
	});

	test('Read metadata that does not exist', () => {
		return problem.searchProblemData(path.join(__dirname,"files"),'nofilelikethis.c').then((metadata:ProblemData | null) => {
			// assert metadata is null
			assert.strictEqual(metadata, null);
		});
	});

	const newSrcPath = path.join(__dirname,"files/newdata.c");
	const newData = {
		id:"20c506a8-8555-11ee-b9d1-0242ac120003",
		name:"new sample data for testing",
		url:"https://example.com",
		description:"This is a new sample data for testing saveMetadata function.",
		testcases:[{input:"testcase input 1",output:"testcase output 1"},{input:"testcase input 2",output:"testcase output 2"}],
		srcPath:newSrcPath,
		binPath:"newdata.exe"
	};
	var newDataPath = "";
	test('Create metadata', () => {
		return problem.createMetadata(path.join(__dirname,"files/newdata.c")).then((metadataPath: string) => {
			// assert metadata file exists
			newDataPath = metadataPath;
			assert.strictEqual(fs.existsSync(metadataPath), true);
		});
	});

	test('Save new metadata', () => {
		problem.probDict[newSrcPath] = newData;
		return problem.saveMetadata(newSrcPath).then(() => {
			// success
		}).catch((e)=>{
			// fail assertion
			assert.fail(e);
		});
	});
	
	test('Load metadata', () => {
		delete problem.probDict[newSrcPath];

		return problem.loadMetadata(newSrcPath).then(() => {
			// assert metadata is not null
			assert.notStrictEqual(problem.probDict[newSrcPath], undefined);
			assert.deepStrictEqual(problem.probDict[newSrcPath], newData);
		}).catch((e)=>{
			// fail assertion
			assert.fail(e);
		});
	});
});
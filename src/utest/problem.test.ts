import * as assert from 'assert';

import { CompilePlan, CompileResult, RunningPlan, RunningResult, ProblemData } from '../types';
import * as problem from '../problem';

import path from "path";

// problem.ts
suite('Problem manager test', () => {
	test('Read metadata', () => {
		return problem.searchProblemData(path.join(__dirname,"files"),'samplepath.c').then((metadata:ProblemData)=>{
			assert.deepStrictEqual(metadata,{id:"20c506a8-8555-11ee-b9d1-0242ac120002",name:"Read problem",url:"https://example.com",description:"Simple Read problem. You have to read this metadata file for ensuring the PSCode project's prosperity. Checking the validity of the metadata is out of range for this problem.",testcases:[{input:"testcase input 1",output:"testcase output 1"},{input:"testcase input 2",output:"testcase output 2"}],srcPath:"samplepath.c",binPath:"samplepath.exe"});
		}
		);
	});
});
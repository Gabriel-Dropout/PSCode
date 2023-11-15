// This file contains all the types used in the application

export type Language = "c" | "cpp" | "java" | "python" | "javascript" | "typescript";

// Type for compilation
export type CompilePlan = {
    language: Language;
    srcPath: string;
    binPath: string;
};

export type CompileResult = {
    status: number;
    stderr?: string;
    binPath?: string;
};

// Types for running binary files
export type RunningPlan = {
    binPath: string;
    stdin: string;
    timeLimit: number;
};

export type RunningResult = {
  status: number;
  stdout: string;
  stderr: string;
  time: number;
  timeOut: boolean;
};

// Types for testcases
export type Testcase = {
  input: string;
  output: string;
};

export type TestcaseResult = {
    testcase: Testcase;
    result: RunningResult;
    passed: boolean;
};

// Type for problem
export type Problem = {
    id: string;
    name: string;
    url: string;
    description: string;
    testcases: Testcase[];
    srcPath: string;

    // used later for binary caching
    srcHash: string;
    binPath: string;
};
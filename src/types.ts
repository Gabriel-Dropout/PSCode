// This file contains all the types used in the application

export type Language = "c" | "cpp" | "java" | "python" | "javascript" | "typescript";
export type CompileStatus = "OK" | "CE";
export type RunningStatus = "OK" | "RE" | "TIMEOUT" | "KILLED";

// Type for compilation
export type CompilePlan = {
    language: Language;
    srcPath: string;
    binPath: string;
};

export type CompileResult = {
    status: CompileStatus;
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
  status: RunningStatus;
  stdout: string;
  stderr: string;
  time: number;
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

// Type for problem metadata
export type ProblemData = {
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

export type Problem = {
    src: string;
    metadata: ProblemData;
};
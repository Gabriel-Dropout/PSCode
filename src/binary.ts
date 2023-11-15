/*
Module for direct manipulation of binary files
1. Receive CompilePlan and perform compilation
2. Execute the binary file
3. Terminate the running binary file
4. Delete the binary file
*/

import { CompilePlan, CompileResult, RunningPlan, RunningResult } from './types';
import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';

// Compile the source code
export const compileSrc = (plan: CompilePlan): Promise<CompileResult> => {
    return new Promise((resolve, reject) => {
        // Check if the source file exists
        if (!fs.existsSync(plan.srcPath)) {
            reject({
                status: 1,
                stderr: "Source file does not exist"
            });
        }

        // Check if the binary file exists
        if (fs.existsSync(plan.binPath)) {
            // Check if the source file is newer than the binary file
            if (fs.statSync(plan.srcPath).mtimeMs > fs.statSync(plan.binPath).mtimeMs) {
                // Delete the binary file
                fs.unlinkSync(plan.binPath);
            } else {
                // Binary file is up-to-date
                resolve({
                    status: 0,
                    binPath: plan.binPath
                });
                return;
            }
        }

        // Compile the source file
        let compiler: child_process.ChildProcess;
        switch (plan.language) {
            case "c":
                compiler = child_process.spawn("gcc", [plan.srcPath, "-o", plan.binPath]);
                break;
            case "cpp":
                compiler = child_process.spawn("g++", [plan.srcPath, "-o", plan.binPath]);
                break;
            /*
            case "java":
                compiler = child_process.spawn("javac", [plan.srcPath]);
                break;
            case "python":
                compiler = child_process.spawn("python", ["-m", "py_compile", plan.srcPath]);
                break;
            case "javascript":
                compiler = child_process.spawn("node", ["-c", plan.srcPath]);
                break;
            case "typescript":
                compiler = child_process.spawn("tsc", [plan.srcPath]);
                break;
            */
            default:
                reject({
                    status: 1,
                    stderr: "Unsupported language"
                });
                return;
        }

        // Get the stderr of the compiler
        let stderr = "";
        compiler.stderr?.on("data", (data) => {
            stderr += data;
        });

        // Resolve the promise when the compiler exits
        compiler.on("exit", (code) => {
            if (code === 0) {
                resolve({
                    status: 0,
                    stderr: stderr,
                    binPath: plan.binPath
                });
            } else {
                resolve({
                    status: 1,
                    stderr: stderr
                });
            }
        });
    });
}

/*
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
*/

// Execute the binary file
export const runBin = (plan: RunningPlan): Promise<RunningResult> => {
    return new Promise((resolve, reject) => {
        // Check if the binary file exists
        if (!fs.existsSync(plan.binPath)) {
            reject({
                status: 1,
                stdout: "",
                stderr: "Binary file does not exist",
                time: 0,
                timeOut: false
            });
        }
        console.log("runBin");
        console.log(plan.binPath);

        // Execute the binary file
        const startTime = Date.now();
        const bin = child_process.spawn('./'+plan.binPath);

        // Write the stdin to the binary
        bin.stdin?.write(plan.stdin);

        // Get the stdout and stderr of the binary
        let stdout = "";
        let stderr = "";
        bin.stdout?.on("data", (data) => {
            stdout += data;
        });
        bin.stderr?.on("data", (data) => {
            stderr += data;
        });

        // Resolve the promise when the binary exits
        bin.on("exit", (code) => {
            const time = Date.now() - startTime;
            if (code === 0) {
                resolve({
                    status: code,
                    stdout: stdout,
                    stderr: stderr,
                    time: time,
                    timeOut: false
                });
            } else {
                resolve({
                    status: 1,
                    stdout: stdout,
                    stderr: stderr,
                    time: time,
                    timeOut: false
                });
            }
        });

        // Reject when the binary exits with error
        bin.on("error", (err) => {
            reject({
                status: 1,
                stdout: stdout,
                stderr: stderr,
                time: Date.now() - startTime,
                timeOut: false
            });
        });

        // Terminate the binary if it exceeds the time limit
        setTimeout(() => {
            bin.kill();
            resolve({
                status: 1,
                stdout: stdout,
                stderr: stderr,
                time: Date.now() - startTime,
                timeOut: true
            });
        }, plan.timeLimit);
    });
}
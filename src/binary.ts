/*
Module for direct manipulation of binary files
1. Receive CompilePlan and perform compilation
2. Execute the binary file
3. Terminate the running binary files
4. Delete the binary file
*/

import { CompilePlan, CompileResult, RunningPlan, RunningResult } from './types';
import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';
import { clear } from 'console';

// Type for running binaries to safely manipulate list, timeout and events
type RunningBin = {
    process: child_process.ChildProcess,
    timeout: NodeJS.Timeout | null,
    kill: () => void,
    killSignal: () => void
};

// List of running binaries
let runningBins: RunningBin[] = [];

// Compile the source code
export const compileSrc = (plan: CompilePlan): Promise<CompileResult> => {
    return new Promise((resolve, reject) => {
        // Check if the source file exists
        if (!fs.existsSync(plan.srcPath)) {
            reject("Source file does not exist");
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
                reject("Unsupported language");
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

// Execute the binary file
export const runBin = (plan: RunningPlan): Promise<RunningResult> => {
    return new Promise((resolve, reject) => {
        // Check if the binary file exists
        if (!fs.existsSync(plan.binPath)) {
            reject("Binary file does not exist.");
        }
        console.log(`runBin : running ${plan.binPath}`);

        // Execute the binary file
        const startTime = Date.now();
        const bin = child_process.spawn(plan.binPath,{
            stdio:['pipe','pipe','pipe']
        });
        let stdout = "";
        let stderr = "";

        bin.on('spawn',()=>{
            // Write the stdin to the binary
            bin.stdin.write(plan.stdin);
    
            // Get the stdout and stderr of the binary
            bin.stdout.on("data", (data) => {
                stdout += data;
            });
            bin.stderr.on("data", (data) => {
                stderr += data;
            });
        });

        // Add the binary to the list of running binaries
        const runningBin = {
            process: bin,
            timeout: null,
            kill: () => {
                clearTimeout(timeout);
                bin.removeAllListeners();
                bin.kill();
                runningBins = runningBins.filter((b) => b.process !== bin);
            },
            killSignal: () => {
                resolve({
                    status: "KILLED",
                    stdout: stdout,
                    stderr: stderr,
                    time: Date.now() - startTime
                });
            }
        }
        runningBins.push(runningBin);

        // Terminate the binary if it exceeds the time limit
        const timeout = setTimeout(() => {
            // kill the process
            runningBin.kill();

            resolve({
                status: "TIMEOUT",
                stdout: stdout,
                stderr: stderr,
                time: Date.now() - startTime
            });
        }, plan.timeLimit);

        // Resolve the promise when the binary exits
        bin.on("exit", (code) => {
            // kill the process
            runningBin.kill();

            resolve({
                status: code === 0 ? "OK" : "RE",
                stdout: stdout,
                stderr: stderr,
                time: Date.now() - startTime
            });
        });

        // Reject when the binary exits with error
        bin.on("error", (err) => {
            // kill the process
            runningBin.kill();

            reject("Child process could not be spawned.");
        });
    });
}

// Terminate all running binaries
export const terminateAll = (): void => {
    runningBins.forEach((runningBin) => {
        runningBin.kill();
        runningBin.killSignal();
    });
}

// Delete the binary file
export const deleteBin = (binPath: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        // Check if the binary file exists
        if (!fs.existsSync(binPath)) {
            reject("Binary file does not exist.");
        }

        // Delete the binary file
        fs.unlink(binPath, (err) => {
            if (err) {
                reject("Binary file could not be deleted.");
            } else {
                resolve();
            }
        });
    });
}
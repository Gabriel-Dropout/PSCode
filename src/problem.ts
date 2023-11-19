// Problem metadata, open/close 등 Problem에 관련된 기능을 정의합니다.
import { ProblemData } from './types';
import * as fs from 'fs';
import * as path from 'path';

// Opened metadata files
export var probDict: { [key: string]: ProblemData } = {};

const readMetadata = async (metadataPath: string): Promise<ProblemData> => {
    const data = await fs.promises.readFile(metadataPath);
    let metadata: ProblemData;

    // JSON parsing may fail, but it will be ignored
    // by caller, searchProblemData().
    metadata = JSON.parse(data.toString());

    // checking whether every key is present.
    // value presence and type is not checked. (TODO)
    // need more elegant solution for checking possible errors.
    const keys = Object.keys(metadata);
    if  (keys.includes('id') &&
        keys.includes('name') &&
        keys.includes('url') &&
        keys.includes('description') &&
        keys.includes('testcases') &&
        keys.includes('srcPath') &&
        keys.includes('binPath')) {
        return metadata;
    } else {
        throw new Error('Invalid metadata');
    }
};

export const searchProblemData = async (searchDir: string, srcPath: string): Promise<ProblemData | null> => {
    const files = await fs.promises.readdir(searchDir);

    // find the metadata file
    for (let filename of files) {
        if (path.extname(filename) === '.prob') {
            const metadataPath = path.join(searchDir, filename);
            const metadata: ProblemData = await readMetadata(metadataPath);
            if (metadata.srcPath === srcPath) {
                return metadata;
            }
        }
    }
    return null;
};

export const searchProblemDataPath = async (searchDir: string, srcPath: string): Promise<string | null> => {
    const files = await fs.promises.readdir(searchDir);

    // find the metadata path
    for (let filename of files) {
        if (path.extname(filename) === '.prob') {
            const metadataPath = path.join(searchDir, filename);
            const metadata: ProblemData = await readMetadata(metadataPath);
            if (metadata.srcPath === srcPath) {
                return metadataPath;
            }
        }
    }
    return null;
};

export const createMetadata = async (srcPath: string): Promise<string> => {
    // ensure that metadata file does not exist.
    const probDataPath: string | null = await searchProblemDataPath(path.dirname(srcPath), srcPath);
    if (probDataPath !== null) {
        throw new Error(`metadata file already exists for ${srcPath}.`);
    }

    // get dirname of srcPath. create random hash. create metadata file.
    const dirname = path.dirname(srcPath);
    const hash = Math.random().toString(36).substring(2, 15);
    const metadataPath = path.join(dirname, hash + '.prob');
    const metadata: ProblemData = {
        id: hash,
        name: `New Problem ${hash}`,
        url: 'https://example.com',
        description: 'This is a new problem.',
        testcases: [],
        srcPath: srcPath,
        binPath: ''
    };
    // create metadata file
    await fs.promises.writeFile(metadataPath, JSON.stringify(metadata));
    return metadataPath;
};

export const saveMetadata = async (srcPath: string): Promise<void> => {
    const probData: ProblemData = probDict[srcPath];
    const probDataPath: string | null = await searchProblemDataPath(path.dirname(srcPath), srcPath);
    if (probData === undefined || probDataPath === null) {
        throw new Error(`metadata file not opened for ${srcPath}.`);
    }

    const filePath = path.join(__dirname, "metadata.json");
    await fs.promises.writeFile(probDataPath, JSON.stringify(probData));
    return;
};

export const loadMetadata = async (srcPath: string): Promise<void> => {
    if(probDict[srcPath] !== undefined) return;

    const probData: ProblemData | null = await searchProblemData(path.dirname(srcPath), srcPath);
    if (probData === null) {
        throw new Error(`metadata file not found for ${srcPath}.`);
    }

    probDict[srcPath] = probData;
    return;
}
// Problem metadata, open/close 등 Problem에 관련된 기능을 정의합니다.
import {ProblemData} from './types';
import * as fs from 'fs';
import * as path from 'path';

const readMetadata = (metadataPath:string): Promise<ProblemData> =>{
    return new Promise((resolve,reject)=>{

        fs.readFile(metadataPath,(err,data)=>{
            if(err) {
                throw err;
            }
            else{
                let metadata: ProblemData;

                // JSON parsing may fail, but it will be ignored
                // by caller, searchProblemData().
                metadata = JSON.parse(data.toString());

                // checking whether every key is present.
                // value presence and type is not checked. (TODO)
                // need more elegant solution for checking possible errors.
                const keys = Object.keys(metadata);
                if(keys.includes('id') && keys.includes('name') && keys.includes('url') && keys.includes('description') && keys.includes('testcases') && keys.includes('srcPath') && keys.includes('binPath')){
                    resolve(metadata);
                }
                else{
                    reject();
                }
            }
        });
    });
};

export const searchProblemData = (searchDir:string, srcPath:string): Promise<ProblemData> => {
    return new Promise((resolve, reject)=>{
        fs.readdir(searchDir,async (err,files)=>{
            if(err){
                reject(err);
            }

            // find the metadata file
            for(let filename of files){
                if(path.extname(filename)==='.prob'){
                    const metadata:ProblemData = await readMetadata(path.join(searchDir,filename));
                    if(metadata.srcPath === srcPath){
                        resolve(metadata);
                        return;
                    }
                }
            }
            reject(Error("File not found"));
        });

    });
};
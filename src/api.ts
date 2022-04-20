import db from "./db";
import {GetItemCommand,PutItemCommand,UpdateItemCommand,DeleteItemCommand,ScanCommand} from "@aws-sdk/client-dynamodb";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";

const getPatient=async (event:any)=>{
    const response={statusCode:200,body:{}};
    try {
        const params={
            TableName:process.env.DYNAMODB_TABLE_NAME,
            Key:marshall({patientId:event.pathParameters.patientId})
        };

        const { Item }=await db.send(new GetItemCommand(params));
        console.log("Item : ",{ Item })
        response.body=JSON.stringify({
            message:"Successfully retrieved patient",
            data:(Item)?unmarshall(Item):{}
            
        })
        // rawData:Item
        
    } catch (error:any) {
        console.log("Error",error);
        response.statusCode=500;
        response.body=JSON.stringify({
            message:"Failed to get patient",
            errorMsg:error.message,
            errorStack:error.stack
        })
    }
    return response;
}

const addPatient=async (event:any)=>{
    const response={statusCode:200,body:{}};
    try {
        const body=JSON.parse(event.body);
        const params={
            TableName:process.env.DYNAMODB_TABLE_NAME,
            Item:marshall(body || {})
        };

        const createResult=await db.send(new PutItemCommand(params));
        console.log("createResult : ",createResult)
        response.body=JSON.stringify({
            message:"Patient added successfully",
            createResult
        })

        
    } catch (error:any) {
        console.log("Error",error);
        response.statusCode=500;
        response.body=JSON.stringify({
            message:"Failed to add patient",
            errorMsg:error.message,
            errorStack:error.stack
        })
    }
    return response;
}

const updatePatient=async (event:any)=>{
    const response={statusCode:200,body:{}};
    try {
        const body=JSON.parse(event.body);
        const objKeys=Object.keys(body);
        const params={
            TableName:process.env.DYNAMODB_TABLE_NAME,
            Key:marshall({patientId:event.pathParameters.patientId}),
            UpdateExpression: `SET ${objKeys.map((_, index) => `#key${index} = :value${index}`).join(", ")}`,
            ExpressionAttributeNames: objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`#key${index}`]: key,
            }), {}),
            ExpressionAttributeValues: marshall(objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`:value${index}`]: body[key],
            }), {})),
        };

        const updateResult=await db.send(new UpdateItemCommand(params));
        console.log("updateResult : ",updateResult)
        response.body=JSON.stringify({
            message:"Patient updated successfully",
            updateResult
        })

        
    } catch (error:any) {
        console.log("Error",error);
        response.statusCode=500;
        response.body=JSON.stringify({
            message:"Failed to update patient",
            errorMsg:error.message,
            errorStack:error.stack
        })
    }
    return response;
}

const deletePatient = async (event:any) => {
    const response = { statusCode: 200,body:{} };

    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({ patientId: event.pathParameters.patientId }),
        };
        const deleteResult = await db.send(new DeleteItemCommand(params));

        response.body = JSON.stringify({
            message: "Successfully deleted patient.",
            deleteResult,
        });
    } catch (error:any) {
        console.error(error);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to delete patient.",
            errorMsg: error.message,
            errorStack: error.stack,
        });
    }

    return response;
};

const getAllPatients = async () => {
    const response = { statusCode: 200,body:{} };

    try {
        const { Items } = await db.send(new ScanCommand({ TableName: process.env.DYNAMODB_TABLE_NAME }));

        response.body = JSON.stringify({
            message: "Successfully retrieved all patients.",
            data: Items?Items.map((item) => unmarshall(item)):[],
            
        });
        // Items,
    } catch (error:any) {
        console.error(error);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to retrieve patients.",
            errorMsg: error.message,
            errorStack: error.stack,
        });
    }

    return response;
};

export {
    getPatient,
    addPatient,
    updatePatient,
    deletePatient,
    getAllPatients,
};
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import fs from 'fs';
const app=express();
app.use(cors());
app.use(morgan('dev'));
const logger=(req,res,next)=> {
    const start=Date.now();
    res.on('finish',() => {
        const duration = Date.now() - start;
        const log=`${req.method}${req.url}${req.statusCode}-${duration}ms\n`;
        fs.appendFile('./server.log',log,(error) => {
            if(error) {
                console.error("Failed to write to log file:",error);
            }
        });
    });
    next();
};
app.use(logger);
app.use(express.json());
app.use(express.urlencoded({extended:true}));
const validate=(req,res,next)=> {
    const {name,gender,ward}=req.body;
    if(!name || !gender || !ward) {
    const err=new Error("Patient details missing");
    err.statusCode = 400;
    throw err;
    }
    next();
};
//create
app.post("/api/v1/patients",validate, (req,res)=> {
    res.status(200).send("Patient record created successfully");
});
// app.get("/api/v1/patients", (req,res)=> {
//     res.status(200).send("All patients records fetched successfully");
// });
app.get("/api/v1/patients/:id", (req,res)=> {
    const id=req.params.id;
    res.status(200).send(`Patient with ${id} record fetched successfully`);
});
app.get("/api/v1/patients",(req,res)=> {
    const ward=req.query.ward;
    if(ward) {
        res.status(200).send(`Patient records in ward${ward} fetched successfully`);
    }else {
        res.status(200).send("All patients records fetched successfully");
    }
});
app.put("/api/v1/patients/:id",(req,res)=> {
    const id=req.params.id;
    res.status(200).send(`Patient with ${id} record updated successfully`);
});
app.delete("/api/v1/patients/:id",(req,res)=> {
    const id=req.params.id;
    res.status(200).send(`Patient with ${id} record deleted successfully`);
});
app.use((err,req,res,next)=> {
    const status = err.statusCode || 500;
    const message=err.message || "Internal Server Error";
    res.status(status).send(message);
});
const PORT=process.env.PORT || 6001;
app.listen(PORT , ()=> {
    console.log(`Server running at http://localhost:${PORT}/api/v1/patients`);
});

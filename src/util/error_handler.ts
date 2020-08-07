import {Response} from "express";

//a mensagem `e do tipo any porque pode ser tando uma string, quanto objetos ou array de objetos em alguns casos
export const errorResponse = (res: Response, message: any) => {
   return res.status(500).json({error: message})
}
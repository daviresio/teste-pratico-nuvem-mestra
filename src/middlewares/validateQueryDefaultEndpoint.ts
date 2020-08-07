import {query} from "express-validator";

const validateQueryDefaultEndpoint = [
    query('state').isLength({min: 2, max: 2})
        .withMessage('O state deve ser informado com 2 caracteres, ex: GO'),
    query('dateStart').isDate().withMessage('O dateStart deve ser informado no formato yyyy-MM-dd'),
    query('dateEnd').isDate().withMessage('O dateEnd deve ser informado no formato yyyy-MM-dd'),
]

export default validateQueryDefaultEndpoint
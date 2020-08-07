import {Router} from 'express'
import {receiveStateAndPeriodToSearch} from "../controller/consumerCovidData";
import validateQueryDefaultEndpoint from "../middlewares/validateQueryDefaultEndpoint";

const router = Router()

router.get('/', validateQueryDefaultEndpoint, receiveStateAndPeriodToSearch)

export default router
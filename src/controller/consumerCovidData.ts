import {Request, Response} from "express";
import {validationResult} from 'express-validator'
import {getDateFromString} from "../util/date_util";
import axios from 'axios'
import {URL_COVID_API, URL_ENVIO_RESULTADO_API} from "../config/constants";
import DadosCovid from "../models/dado_covid.model";
import {errorResponse} from "../util/error_handler";
import Big from "big.js";
import DadoCovidCalculado from "../models/dado_covid_calculado.model";

export const receiveStateAndPeriodToSearch = async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req)

        //erros capturados pelo middleware que valida os dados passados na url
        if (!errors.isEmpty()) {
            return errorResponse(res, errors.array())
        }

        const {state, dateStart, dateEnd}: any = req.query

        //Valido se a data incial e final sao diferentes e se a data inicial nao `e maior que a data final
        if (dateStart === dateEnd) {
            return errorResponse(res, 'A data inicial e final devem ser diferentes')
        } else if (getDateFromString(dateStart).getTime() > getDateFromString(dateEnd).getTime()) {
            return errorResponse(res, 'A data inicial nao pode ser maior que a data final')
        }


        const [startArr, endArr] = await Promise.all([
            consumeCovidApi(state, dateStart),
            consumeCovidApi(state, dateEnd),
        ])

        //Percebi que nem todas as cidades que vem em em uma busca com a data inicial, tambem vem na final,
        //entao crio um novo array com os registros que vem nas datas iniciais e finais juntos

        // @ts-ignore
        const dataArr: [DadosCovid[]] = []

        startArr.map((dadoCovid) => {
            const endArrPosition = endArr.findIndex((dado) => dado.cidade === dadoCovid.cidade)

            if (endArrPosition !== -1) {
                const dadoCovidFinal = endArr[endArrPosition]
                //as vezes alguma propriedade vem nula, nesse caso ignore os registros inconsistentes, ja que nao vou conseguir concluir seu processamento
                if (hasValue(dadoCovid) && hasValue(dadoCovidFinal)) {
                    dataArr.push([dadoCovid, dadoCovidFinal])
                }
            }

        })

        //Se o tamanho for menor que 10 entao a data inicial ou final tem muitos poucos registros que sao da mesma cidade
        //e como preciso enviar 10 registros para entregar a avaliacao, disparo um erro pedindo para tentar com outra data
        if (dataArr.length < 10) {
            return errorResponse(res, 'A data inicial ou final tem poucos registros. `e necessario' +
                ' que tenha uma combinacao de pelo menos 10 cidades na data inicial e final informada, por favor selecione' +
                ' outra data ou outro estado')
        }


        let finalResult = dataArr.map(([dadoInicio, dadoFim]: DadosCovid[]) => {
            const novosCasos = new Big(dadoFim.casosConfirmados).minus(dadoInicio.casosConfirmados)
            const porcentagem = novosCasos.div(dadoInicio.populacao).mul(100).toFixed(5)
            const result: DadoCovidCalculado = {
                nomeCidade: dadoInicio.cidade,
                percentualDeCasos: Number(porcentagem),
            }
            return result
        })

        finalResult = finalResult.sort(((a: DadoCovidCalculado, b: DadoCovidCalculado) => {
            if (a.percentualDeCasos < b.percentualDeCasos) return 1
            if (b.percentualDeCasos < a.percentualDeCasos) return -1
            return 0
        }))

        finalResult = finalResult.slice(0, 10)
        const dataToSend = finalResult.map((value: DadoCovidCalculado, index: number) => ({...value, id: index}))
        const response = await Promise.all(dataToSend.map((data: DadoCovidCalculado) => enviaResultadoFinal(data)))

        res.send(response)

    } catch (e) {
        return errorResponse(res, e.stack)
    }

}


const consumeCovidApi = async (state: string, date: string): Promise<DadosCovid[]> => {
    return axios.get(`${URL_COVID_API}?state=${state}&date=${date}`).then(({data}) => {
        const {results} = data
        return results.map((result: any) => {
            return {
                casosConfirmados: result['confirmed'],
                populacao: result['estimated_population_2019'],
                cidade: result['city'],
            }
        })
    })
}


const enviaResultadoFinal = async (data: DadoCovidCalculado): Promise<any> => {
    return axios.post(`${URL_ENVIO_RESULTADO_API}`, data, {
        headers: {
            MeuNome: 'Davi Resio'
        }
    }).then(({data}) => data)
}


const hasValue = (value: DadosCovid) => {
    return !(value.populacao === null || value.casosConfirmados === null || value.cidade === null);
}

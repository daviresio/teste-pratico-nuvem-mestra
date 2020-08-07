import express, {Application} from 'express';
import routes from './routes'

const app: Application = express();

app.use('/', routes)



app.listen(process.env.PORT || 3000, ()=> console.log('server on'))
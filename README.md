Teste pratico para vaga de backend developer da nuvem mestra<br>
para rodar o projeto siga estes passos:<br><br>

Faca o clone do repositorio, em seguida digite  **npm install** e logo apos **npm start**<br><br>

uma imagem docker tambem esta disponivel pronta para execucao com o seguinte comando:<br><br>

**docker run -p 3000:3000 daviresio/teste-pratico-nuvem-mestra:latest**<br><br><br>


por um periodo limitade de tempo vou manter a api rodando nos servidores da GCP para facilitar o acesso atravez do link<br><br>

**http://35.224.68.47:3000?state=SP&dateStart=2020-05-11&dateEnd=2020-05-18**<br><br><br>



a requisicao da api dese ser feita na rota raiz e necessita de 3 parametros:<br><br>

state = Sigla de 2 letras da unidade federativa<br>
dateStart = data inicial no formato yyyy-MM-dd<br>
dateEnd = data final no formato yyyy-MM-dd<br>

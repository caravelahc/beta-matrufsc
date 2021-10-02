CAPIM
=====

Fork do MatrUFSC que possibilita a realização de pedidos de matrícula fora da interface do CAGR. Através de uma vulnerabilidade CSRF exposta pelo CAGR é possível emitir a requisição de matrícula (`form`) através de outro site, tal requisição terá sucesso desde que o usuário já esteja logado no sistema universitário.

Site: https://beta.matrufsc.caravela.club
Wiki: https://github.com/caravelahc/capim/wiki

-----

### Servidor

https://github.com/pet-comp-ufsc/moita

### Build

```bash
./configure --base-path=bin
SITE_PATH=bin make
```

Não se esqueça de copiar os arquivos dos bancos de dados pra pasta na qual o sistema está instalado.

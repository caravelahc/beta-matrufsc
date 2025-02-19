CAPIM
=====

Fork do [MatrUFSC](https://github.com/caravelahc/capim) que possibilita a realização de pedidos de matrícula fora da interface do CAGR. Através de uma vulnerabilidade CSRF exposta pelo CAGR é possível emitir a requisição de matrícula (`form`) através de outro site, tal requisição terá sucesso desde que o usuário já esteja logado no sistema universitário.

Site: https://beta.matrufsc.caravela.club<br>
Explicação de como a vulnerabilidade funciona: https://repositorio.ufsc.br/handle/123456789/243426 ([**PDF**](https://repositorio.ufsc.br/bitstream/handle/123456789/243426/TCC_Artur_Barichello.pdf?sequence=1&isAllowed=y))

-----

### Atualizando através do GitHub Actions
1. Atualize o semestre atual em https://github.com/caravelahc/beta-matrufsc/blob/master/.github/workflows/database.yml
2. Rode o workflow manualmente em https://github.com/caravelahc/beta-matrufsc/actions/workflows/database.yml
3. Cheque se o JSON foi adicionado na branch: https://github.com/caravelahc/beta-matrufsc/tree/gh-pages/data

### Servidor

https://github.com/pet-comp-ufsc/moita

### Build

```bash
./configure --base-path=bin
SITE_PATH=bin make
```

Não se esqueça de copiar os arquivos dos bancos de dados pra pasta na qual o sistema está instalado.

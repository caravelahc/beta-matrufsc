Este repositório contém os bancos de dados extraídos do CAGR para serem
utilizados no MatrUFSC, disponível no seguinte repositório:
https://github.com/ramiropolla/matrufsc_dbs.git

O banco de dados é gerado usando os script py/get_turmas.py e
py/parse_turmas.py. Estes scripts são específicos para o sistema de
cadastro de disciplinas da UFSC.

get_turmas.py pega os dados do CAGR e os grava separados por semestre e campus.
O modo de usar é: ./py/get_turmas.py <username> <password> [semestre]
parse_turmas.py gera arquivos .json dos arquivos xml criados por get_turmas.
O modo de usar é: ./py/parse_turmas.py <arquivos de entrada> <arquivo de saída>

Os arquivos finais .json seguem a seguinte estrutura:

{ "DATA": "<data e hora da captura>", "<código do campus>" : [lista de disciplinas] }

Cada disciplina é uma lista com a seguinte estrutura:
[ "código da disciplina", "nome da disciplina em ascii e caixa alta", "nome da disciplina", [lista de turmas] ]

Cada turma é uma lista com a seguinte estrutura:
[ "nome_turma", horas_aula, vagas_ofertadas, vagas_ocupadas, alunos_especiais, saldo_vagas, pedidos_sem_vaga, [horarios], [professores]]

Os dados relativos a horas_aula e vagas são em números, não strings.
Os horários são no formato disponibilizado pela UFSC:
"2.1010-2 / ARA-ARA209"
 | |    |   |   \----- código da sala
 | |    |   \--------- código do departamento
 | |    \------------- número de aulas seguidas no bloco
 | \------------------ horário da primeira aula do bloco
 \-------------------- dia da semana

Os professores são dispostos numa lista de strings.


Para instalar os bancos de dados, basta copiar os arquivos, ou rodar:
make DESTDIR="/<pasta_do_site>/matrufsc-<versao>" install


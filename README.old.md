CAPIM
=====

Introdução
==========

O **CAPIM** foi escrito para substituir um serviço similar que existia para os
estudantes da UFSC, o **GRAMA** (GRAde de MAtrícula), que foi escrito por um
estudante de Engenharia de Produção e tinha o apoio da universidade, pelo site
http://grama.ufsc.br (desativado).

O GRAMA estava tecnologicamente defasado, não aproveitando facilidades como
*XMLHttpRequest* e o poder de processamento dos navegadores modernos.

O GRAMA perdeu o apoio da UFSC quando tentou se aproveitar da popularidade do
serviço para fazer propaganda própria da empresa criada pelo seu autor, que
acabara de se formar da UFSC.

Esse foi o momento propício para criar outro sistema que substituisse o GRAMA.
Foi então que o CAPIM surgiu, a princípio com o nome de MatrUFSC, estando
disponível inicialmente para o período de matrícula do semestre 2012-1.

Vendo os erros e as falhas de outros serviços semelhantes, o CAPIM nasceu com
os seguintes princípios:
- Simplicidade e facilidade de uso:
  O aplicativo deve seguir o princípio KISS - Keep it Simple, Stupid, e deve
  ser simples e fácil de usar.
- Não ao culto de personalidade:
  Pouco importa para o usuário quem fez o sistema. Este não deve ser usado como
  meio de promoção individual ou comercial, salvo se for alguma instituição de
  alunos para alunos, sem fins comerciais ou outros interesses (por exemplo:
  algum centro acadêmico). Créditos aos desenvolvedores devem ser dados em
  algum lugar discreto do aplicativo.
- Sem retorno financeiro:
  O site não deve ser poluído com propagandas e logos de apoio. Quem está
  tomando seu tempo para desenvolver o site deve ter como única recompensa o
  fato de saber que seu trabalho está sendo usado e apreciado por milhares de
  pessoas.
- Não ao acúmulo de dados pessoais dos usuários:
  Não existe necessidade nenhuma de ter os dados pessoais dos usuários no
  servidor. Nem e-mail, nem login, nem CPF (sério, tem site para
  **universitário** que pede até CPF no cadastro). O CAPIM permite ao usuário
  fazer download e upload de seu horário, sem precisar nem gravar nada no
  servidor. Os usuários podem usar qualquer identificador para gravar seus
  horários no sistema se quiserem.

(admito que depois de certo ponto não consegui mais seguir o princípio KISS =)

-----

Licença
=======
A ideia original era fazer o CAPIM ser código-livre. Porém, as licenças mais
comuns (como a GPL) não atenderiam a algumas restrições que eu gostaria de
impor ao código. Portanto, aqui defino a licença do CAPIM:

1. É proibido qualquer tipo de retorno financeiro, direta ou indiretamente,
   como, por exemplo:
   - o uso de propagandas, divulgação, apoio, troca de favores ou serviços
   afins no próprio site do aplicativo, em qualquer site que leve ao aplicativo
   e em qualquer site relacionado ao aplicativo;
   - cobrar pela utilização do serviço ou qualquer serviço adicional;
   - a venda de informações dos usuários;
2. É proibido o acúmulo de informações pessoais dos usuários, exceto pelos
   próprios horários que eles mesmos salvarem com um identificador de escolha
   deles;
3. É proibida a promoção pessoal do(s) desenvolvedor(es), exceto por uma menção
   em uma janela discreta para esta finalidade. Esta janela só deve aparecer
   quando solicitada pelo usuário e deve conter crédito para todos os
   desenvolvedores envolvidos, atuais e passados;
4. São permitidos o desenvolvimento e distribuição independentes do projeto,
   contanto que seja mantida esta licença e seja usado outro nome para o
   projeto;
5. O código fonte deve ser disponibilizado em algum repositório público, cujo
   endereço deve ser promovido em algum lugar do aplicativo;
6. Toda alteração ao código também deve obedecer a esta licença.

# Doce Gestão — Escopo funcional

**Objetivo da entrega:** uma aplicação simples de portfólio para organizar encomendas de doces, acompanhar sua conclusão e consultar um resumo semanal das vendas concluídas.

**Situação:** escopo definido; implementação parcial, conforme o levantamento disponível.

**Última consolidação:** 12 de outubro de 2026.

Este documento registra as decisões tomadas na definição do projeto. A apresentação do repositório está em [readme.md](./readme.md). Funcionalidade incluída no escopo não significa funcionalidade já implementada.

## 1. Objetivo e limites do produto

O Doce Gestão será uma agenda de encomendas de doces. Seu objetivo é ajudar a pessoa responsável pela produção a visualizar o que precisa entregar, para qual cliente, em qual quantidade e horário, além de acompanhar o andamento do trabalho.

A aplicação também servirá para demonstrar conhecimentos de JavaScript, TypeScript, manipulação do DOM, organização em módulos, consumo de API e operações de cadastro, consulta, edição e exclusão — o CRUD.

Neste documento, **usuário** é quem organiza a produção e utiliza a aplicação; **cliente** é a pessoa identificada na encomenda. “Agendamento”, “encomenda” e “produção” se referem ao registro organizado na agenda, não a três módulos independentes.

A entrega terá uma tela principal com agenda diária, progresso do dia e resumo semanal de vendas, além do formulário de cadastro e edição. Não será necessário criar uma página de relatórios ou um sistema completo de gestão de confeitaria.

## 2. Ponto de partida: o que já foi informado como funcional

O estado abaixo vem do documento de contexto `Texto colado.txt`. Não houve inspeção completa do repositório nem execução de testes para confirmar as implementações. As decisões posteriores da conversa ampliam o escopo, mas não comprovam que novos recursos tenham sido desenvolvidos.

| Recurso | Estado informado |
| --- | --- |
| Buscar produções com `GET /productions` | Funcional |
| Renderizar a listagem dinamicamente no DOM | Funcional |
| Abrir e fechar o modal de nova produção | Funcional |
| Ler os campos do formulário e montar um `ProductionInput` | Funcional |
| Criar uma produção com `POST /productions` | Funcional |
| Persistir a produção em `db.json` | Funcional |
| Receber da API o registro criado, com identificador automático | Funcional |
| Limpar o formulário com `reset()` após o cadastro | Funcional |
| Fechar o modal automaticamente após salvar | Pendente |
| Atualizar automaticamente a listagem após salvar | Pendente |
| Excluir e editar produções | Pendentes |
| Agenda diária, múltiplos produtos, status, progresso e resumo semanal | Planejados; implementação não informada |

O cadastro existente foi descrito com **um produto e uma quantidade por registro**. Ele ainda não deve ser apresentado como um cadastro funcional de múltiplos produtos, valor de venda e status.

## 3. Funcionalidades da versão de portfólio

Todos os requisitos desta seção fazem parte da entrega planejada. Os identificadores servem apenas para relacionar tarefas e verificações, sem exigir novas pastas ou camadas de arquitetura.

### RF-01 — Consultar a agenda de um dia

A tela abre com a data atual selecionada e permite escolher outra data. A agenda mostra somente as encomendas cuja **data de entrega agendada** corresponde ao dia selecionado.

As encomendas são agrupadas em **Manhã**, **Tarde** e **Noite**, nessa ordem, e ordenadas pelo horário de entrega dentro de cada grupo. O período é determinado automaticamente pelo horário; não será um campo separado para o usuário preencher.

**Somente períodos com encomendas aparecem.** Se houver entregas pela manhã e à tarde, a seção Noite não é exibida, nem mesmo como título ou espaço reservado. Se não houver nenhuma encomenda no dia, a tela apresenta uma mensagem de agenda vazia e mantém disponível a ação de novo cadastro.

Criar, editar ou excluir uma encomenda atualiza os grupos visíveis. Remover a última encomenda de um período faz esse grupo desaparecer; cadastrar a primeira faz o grupo aparecer.

As encomendas concluídas continuam visíveis em sua data de entrega, identificadas pelo status. Concluir uma encomenda não equivale a excluí-la.

**Critério de conclusão:** trocar a data altera os registros exibidos; períodos vazios não aparecem; horários ficam em ordem crescente; o dia sem registros apresenta um estado vazio.

**A definir:** os limites exatos de cada período e o tratamento de horários da madrugada, sem deixar horários válidos sem classificação.

### RF-02 — Cadastrar uma encomenda

A ação de nova encomenda abre o formulário. Cada agendamento reúne as seguintes informações:

| Informação | Significado |
| --- | --- |
| Nome do cliente | Identificação textual de quem fez a encomenda |
| Produtos | Um ou mais itens, cada um com nome e quantidade de unidades |
| Data de entrega | Dia em que todos os itens devem ser entregues |
| Horário de entrega | Horário exato da entrega compartilhada pelos itens |
| Valor final da venda | Valor total da encomenda, informado manualmente |
| Observações | Informações adicionais do agendamento; obrigatoriedade ainda a confirmar |

Todos os itens compartilham o mesmo cliente, data e horário de entrega. Produtos que precisem de entregas em momentos diferentes devem ser registrados em agendamentos separados.

O valor representa o **total da venda**, não o preço de uma unidade, o custo, o lucro ou um pagamento recebido. Não haverá cálculo por item, desconto ou subtotal nesta versão.

Após a API confirmar o cadastro, o formulário é limpo, o modal fecha e a agenda é atualizada. Se a encomenda for de outra data, ela deve aparecer ao consultar essa data, sem ser inserida indevidamente no dia em exibição.

**Critério de conclusão:** salvar cria um único agendamento com todos os dados e itens, que permanece disponível após recarregar a página.

### RF-03 — Informar vários produtos na mesma encomenda

O formulário começa com uma linha de produto e quantidade. A ação **Adicionar produto** acrescenta outra linha. O usuário pode remover itens antes de salvar, mantendo pelo menos um produto no agendamento.

Os nomes são digitados livremente. Não há catálogo prévio, busca em cadastro de produtos ou cadastro independente de clientes.

Exemplo fictício de uma encomenda:

| Produto | Unidades |
| --- | ---: |
| Brigadeiro de chocolate | 20 |
| Beijinho | 15 |
| Brownie | 10 |

Esses itens pertencem a uma única entrega e possuem um único valor final de venda. A quantidade pertence a cada produto; um total agregado de unidades não substitui a discriminação dos itens.

**Critério de conclusão:** cadastrar, visualizar e editar uma encomenda preserva o nome e a quantidade de cada item, sem criar um agendamento separado para cada doce.

### RF-04 — Visualizar os dados de uma encomenda

Cada encomenda aparece uma única vez na agenda, no período correspondente ao horário de entrega. Sua apresentação permite identificar cliente, horário, produtos com quantidades, valor total e status.

As observações ficam acessíveis no registro ou no formulário de edição. A posição visual exata desse conteúdo não está fechada.

O registro oferece acesso às ações de edição, exclusão e alteração de status. Nenhuma dessas ações deve depender da posição do cartão na lista para identificar a encomenda.

**Critério de conclusão:** é possível identificar o que será entregue e para quem, distinguindo as quantidades de cada produto e o andamento da encomenda.

### RF-05 — Editar uma encomenda

O usuário pode abrir uma encomenda existente, consultar seus dados e alterar cliente, itens, quantidades, entrega, valor final e observações. Durante a edição, também pode adicionar e remover produtos, mantendo pelo menos um item.

Salvar modifica o registro existente, sem criar outra encomenda. Cancelar descarta as alterações ainda não salvas. Abrir um novo cadastro depois de uma edição não deve reutilizar o identificador ou os dados do registro anterior.

Alterar a data ou o horário reorganiza a encomenda na agenda. A interface mantém coerentes os grupos, o progresso diário e o resumo semanal que forem afetados pela edição.

**Critério de conclusão:** a alteração persiste após recarregar a página; o registro não é duplicado; mudar a entrega reposiciona corretamente a encomenda.

**Abordagem proposta, sujeita à inspeção do código:** reutilizar o modal existente para criação e edição, sem exigir uma tela adicional.

### RF-06 — Excluir uma encomenda

A exclusão remove o agendamento inteiro, incluindo seus itens. A interface solicita confirmação, permite cancelar e identifica a encomenda que será removida.

Depois da confirmação de sucesso pela API, a agenda e os indicadores são atualizados. Excluir a última encomenda de um período oculta o grupo; excluir a última do dia apresenta a agenda vazia.

Se uma encomenda concluída for excluída, ela também deixa de participar do resumo semanal calculado a partir dos registros atuais.

**Critério de conclusão:** confirmar remove somente a encomenda selecionada; cancelar mantém os dados; a exclusão permanece válida após recarregar a página.

A exclusão não cria um status de cancelamento nem um histórico de registros removidos. Um fluxo próprio de cancelamento não foi aprovado para esta versão.

### RF-07 — Acompanhar e alterar o status

Cada encomenda terá um dos três status:

| Status | Significado | Participa do total de vendas? |
| --- | --- | --- |
| Pendente | Produção ainda não iniciada | Não |
| Em produção | Preparo em andamento | Não |
| Concluída | Encomenda finalizada e entregue, conforme indicação do usuário | Sim |

O usuário pode alterar o status diretamente na agenda, sem precisar abrir a edição completa, e pode corrigir uma seleção feita por engano. Não haverá etapas obrigatórias de aprovação nem status individuais por produto.

Ao marcar uma encomenda como concluída, a aplicação registra a data de conclusão. A conclusão depende dessa ação explícita: atingir o horário de entrega não conclui automaticamente o registro.

Se o status deixar de ser Concluída, a encomenda deixa de contar como concluída no progresso e no resumo de vendas. A mesma encomenda não pode ser somada duas vezes apenas porque o status foi salvo novamente.

**Critério de conclusão:** a alteração persiste, atualiza os indicadores e inclui ou retira a encomenda do total semanal conforme seu status.

**A definir:** o status inicial — Pendente é a proposta — e a regra da data de conclusão quando uma encomenda é reaberta e depois concluída novamente.

### RF-08 — Mostrar o progresso diário

A agenda apresenta a quantidade de encomendas concluídas em relação ao total do **dia de entrega selecionado**, por exemplo, “3 de 5 concluídas”. A contagem é de agendamentos, não de produtos ou unidades.

Um percentual ou barra pode complementar essa informação, sem se tornar um sistema de produtividade. A apresentação visual exata fica para a revisão da interface.

O progresso responde a alterações de status, cadastros, exclusões e mudanças de data de entrega. Em um dia sem encomendas, a interface mantém o estado vazio e não apresenta cálculos inválidos.

**Critério de conclusão:** o indicador considera somente as encomendas da data selecionada e reflete os status atuais.

### RF-09 — Consultar o resumo semanal de vendas

Uma seção da própria tela mostra a semana consultada, de **segunda-feira a domingo**, e dois indicadores:

- **Total de vendas concluídas:** soma do valor final das encomendas atualmente concluídas naquela semana.
- **Encomendas concluídas:** quantidade desses agendamentos, não quantidade de produtos ou unidades.

A consulta permite visualizar a semana atual e navegar para semanas anteriores. O intervalo de datas fica explícito para que o usuário identifique o período apresentado. Uma semana sem conclusões mostra total e quantidade iguais a zero.

A referência do cálculo é a **data de conclusão**, registrada quando o usuário marca a encomenda como Concluída. A data de entrega agendada não define a semana da venda.

Exemplo: uma encomenda com entrega agendada para domingo, 11/10/2026, marcada como concluída na segunda-feira, 12/10/2026, entra na semana de **12/10/2026 a 18/10/2026**. Ela continua aparecendo na agenda de 11/10 enquanto sua data de entrega permanecer nesse dia.

A semana consultada e o dia selecionado na agenda são referências distintas. A identificação do período semanal não pode dar a entender que o total corresponde somente ao dia mostrado na agenda.

O resumo usa os registros existentes. Não haverá uma tabela separada de resultados semanais, um livro contábil imutável ou um controle de pagamentos.

**Critério de conclusão:** o total corresponde apenas às encomendas concluídas no intervalo exibido; cada encomenda conta uma vez; navegar entre semanas altera os dois indicadores corretamente.

### RF-10 — Apresentar estados, validações e falhas

A aplicação diferencia listagem em carregamento, agenda vazia e falha ao buscar dados. Um erro de comunicação não deve ser apresentado como ausência de encomendas.

Cadastro e edição validam os dados conforme as regras que ainda serão detalhadas. Campos com problema recebem uma mensagem compreensível, sem apagar os demais valores preenchidos.

Durante uma operação, a interface indica o processamento e evita envios ou acionamentos repetidos. Os controles voltam a ficar disponíveis depois de sucesso ou falha.

**Falha ao gravar e falha ao atualizar a tela são situações diferentes.** Se a API confirmar que a encomenda foi salva, mas a atualização da listagem falhar, a mensagem informa que o cadastro foi concluído e que a visualização precisa ser atualizada. Não orienta a pessoa a cadastrar novamente. O mesmo princípio vale para edição e exclusão.

Se não houver confirmação suficiente para saber se uma gravação aconteceu, a interface não deve afirmar um resultado certo. A recuperação deve permitir conferir os dados antes de repetir a operação.

**Critério de conclusão:** falhas ficam visíveis, o usuário consegue tentar novamente uma consulta e operações não confirmadas não causam perda automática do formulário ou repetição induzida de registros.

## 4. Regras centrais do resumo e do histórico

| Regra | Comportamento definido |
| --- | --- |
| Elegibilidade | Somente o status atual Concluída participa do total vendido |
| Semana de referência | Semana da conclusão, não da entrega agendada |
| Valor considerado | Valor final integral da encomenda, informado manualmente |
| Unidade de contagem | Um agendamento corresponde a uma encomenda concluída |
| Edição do valor | Altera o total da semana à qual a conclusão pertence |
| Exclusão de uma concluída | Retira a encomenda e seu valor do resumo |
| Retorno a outro status | Retira a encomenda do total de concluídas e de vendas |
| Forma de cálculo | Recalcular a partir dos registros atuais, sem acumular somas independentes |

O resumo representa **vendas de encomendas concluídas**, não lucro e não dinheiro efetivamente recebido. Como os registros podem ser alterados, os totais de semanas anteriores também podem mudar. Essa limitação faz parte da abordagem simples adotada, e não equivale a um histórico financeiro imutável.

## 5. Informações atuais e evolução do modelo

### Modelo atual informado

O tipo `Production` foi descrito com `id: number`, `client: string`, `product: string`, `quantity: number`, `preparationTime: string`, `deliveryDate: string` e `notes: string`. `ProductionInput` corresponde a `Production` sem o identificador.

Esse modelo não descreve ainda todas as necessidades do escopo consolidado.

### Informações necessárias à versão planejada

Cada agendamento precisará representar identificador, cliente, lista de itens com nome e quantidade, data e horário de entrega, valor final, observações, status e data de conclusão quando aplicável.

Os nomes novos dos campos e seus formatos técnicos serão definidos na implementação. Não se deve presumir que `preparationTime` já significa horário de entrega, nem que `deliveryDate` já armazena exatamente o formato necessário.

O identificador continua sendo gerado pela API. Seu tipo declarado precisa ser comparado ao retorno real da versão instalada do JSON Server.

A passagem de `product` e `quantity` para uma lista de itens exige adaptar cadastro, listagem e edição. Antes de mudar o modelo, é necessário decidir como tratar os registros existentes de demonstração, sem inventar valores de venda ou datas de conclusão que não foram registrados.

## 6. Experiência de uso e acabamento

A revisão visual acontece depois da consolidação dos fluxos principais. A tela deve continuar simples, sem menus que anunciem funções não implementadas.

O acabamento previsto inclui apresentação legível dos dados, responsividade da agenda e do formulário, mensagens de erro e estado vazio, além da retirada visual de financeiro, estoque e outras áreas abandonadas do escopo original.

Não há compromisso com uma nova identidade visual completa, uma grade de calendário mensal ou bibliotecas adicionais de interface. A pessoa deve conseguir executar o fluxo principal em computador e em tela menor, sem perder acesso aos campos e ações.

## 7. Fora desta versão

Não fazem parte da entrega: gestão de estoque; custos e lucro; pagamentos, recebimentos e caixa; preços individuais, subtotais e descontos; catálogo independente de produtos ou clientes; relatórios avançados, gráficos ou exportações; entregas separadas dentro de uma encomenda; status por produto; e um módulo separado de gestão de pedidos.

Cancelamento com preservação de histórico, autenticação, múltiplos usuários e publicação online **não foram definidos como requisitos**. Não devem virar tarefas obrigatórias nem ser anunciados como recursos disponíveis.

A base informada permanece: HTML, CSS, TypeScript com DOM direto, Webpack e JSON Server. Migração de framework, troca de bundler, backend próprio ou arquitetura empresarial não são condições para concluir o projeto.

## 8. Detalhes ainda a confirmar

Esses pontos refinam funcionalidades existentes no escopo; não representam novos módulos.

| Ponto | Definição pendente |
| --- | --- |
| Períodos do dia | Limites de manhã, tarde e noite, inclusive madrugada |
| Campos do formulário | Obrigatoriedade, tratamento de espaços e limites de texto |
| Quantidades | Confirmar a proposta de unidades inteiras maiores que zero |
| Valor final | Formato monetário, casas decimais e aceitação ou não de valor zero |
| Datas de entrega | Aceitação de datas passadas e demais restrições, se houver |
| Status inicial | Confirmar Pendente como padrão de um novo agendamento |
| Reabertura e nova conclusão | Definir se uma nova conclusão substitui a anterior; o registro deve contar uma única vez |
| Referência temporal | Definir o horário local usado nos limites de dia e semana e na persistência da conclusão |
| Campos antigos | Verificar o significado de `preparationTime` e o formato de `deliveryDate` |
| Dados de demonstração | Definir como adaptar registros antigos ao novo modelo |
| Ambiente local | Conferir scripts, versões, endereços e tipo real do identificador no repositório |

Os detalhes de interface citados como propostas podem ser ajustados sem acrescentar funcionalidades, desde que os comportamentos definidos sejam preservados.

## 9. Sequência imediata já combinada

1. Exportar e reutilizar `closeProductionModal()` de `modal.ts` em `submit.ts`, fechando o modal somente após o cadastro confirmado.
2. Testar esse comportamento e separar a mudança em um commit pequeno.
3. Atualizar a listagem após o cadastro bem-sucedido, sem duplicar registros.
4. Continuar com exclusão e depois edição.

Os demais requisitos entram incrementalmente, adaptando o modelo quando necessário e preservando o que já funciona. Este documento não exige uma refatoração geral antes de continuar.

## 10. Critério de entrega da versão

A versão de portfólio estará concluída quando for possível cadastrar, consultar, editar e excluir encomendas com múltiplos produtos; visualizar o dia correto e somente períodos ocupados; alterar status e acompanhar o progresso; consultar as vendas concluídas por semana de conclusão; e repetir esses fluxos com persistência e tratamento coerente de falhas.

A revisão final deve conferir especialmente: troca de datas, períodos vazios, mudança de horário durante a edição, inclusão e remoção de itens, cancelamento de edição e exclusão, transições de status, passagem de domingo para segunda no resumo, alteração de registros concluídos e falha ao atualizar a tela depois de uma gravação confirmada.

Antes de declarar a entrega concluída, as decisões pendentes relevantes devem estar resolvidas, a execução local deve ser documentada com os comandos reais e o README deve refletir o estado efetivamente verificado do código.

## 11. Base documental

Este escopo consolida o documento de contexto `Texto colado.txt` e as decisões desta conversa: agenda diária com períodos dinâmicos, múltiplos produtos manuais, valor final por encomenda, três status, progresso diário e resumo semanal pela data de conclusão.

As decisões posteriores substituem o recorte inicial de um produto por produção e a sugestão inicial de calcular vendas pela data de entrega. Não houve auditoria do repositório nem implementação de funcionalidades durante a elaboração destes documentos.

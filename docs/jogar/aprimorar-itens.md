# Aprimorar itens: pigmentos e itens que modificam habilidades (0.110)

Armas e armaduras ganharam a aba **Aprimorar**. Ela tem duas partes.

## Pigmentos (Códex Inventariun)

- O pigmento é um Equipamento da categoria **Pigmento**: tem uma cor e uma qualidade (1, 2 ou 3). Os 24 modelos (8 cores × 3 qualidades) estão em *Nauren - Equipamentos*.
- **Aplicar:** abra a arma ou armadura, aba Aprimorar, e arraste o pigmento para "Pigmentos". Se ele estiver numa ficha, gasta 1.
- **Espaços pelo tier do item:** Bronze 1, Prata 2, Ouro 3 (Diamante e Prismático também 3). Item sem tier não aceita.
- **Espaços cheios:** o novo substitui um dos que estão lá (você escolhe qual), e o antigo se perde.
- **Bônus** (+1, +2 ou +3 pela qualidade), só com o item **equipado**:

| Cor | Bônus |
|---|---|
| Vermelho | Poder de Ataque ou Poder de Magia (escolhe ao aplicar) |
| Azul | Espírito |
| Verde | Vitalidade |
| Roxo | menor atributo |
| Preto | limite de Estresse |
| Branco | qualquer meta atributo (escolhe ao aplicar) |
| Rosa | Movimento |
| Dourado | Destino |

- O Mestre tem o botão **+ Pigmento**, que põe um pigmento sem gastar e sem olhar os espaços. Serve para criar itens que já vêm pigmentados, inclusive com mais de um pigmento.
- Na ficha do personagem, os pigmentos aparecem como bolinhas coloridas ao lado do nome do item.

## Modifica habilidades

Enquanto o item estiver **equipado**, ele muda uma Habilidade, Magia ou a Condição que ela aplica.

1. Arraste a Habilidade (do compêndio ou da ficha) para a área pontilhada.
2. Em **O que muda**, escolha na lista. Ela é montada a partir da própria habilidade: dano, cura, escudo, custo, alcance, usos, acúmulos e "aplicar mais uma Condição" de cada Ação; rank; usos da passiva, gatilhos, raio da emanação e bônus passivos; e, da Condição que a habilidade aplica, a cura ou o dano por turno, a duração e os bônus.
3. Em **Como**, escolha: Somar, Dado extra (mais dados do mesmo tamanho), Subir o dado (d4 → d6 → … → d20) ou Adicionar Condição.
4. Em **Valor**, digite o número (ex.: 2, -1 para reduzir custo, 1d4) ou arraste a Condição.

Exemplo: "+2 na cura da Infusão Floral" = arrastar Infusão Floral, escolher *Condição "Infusão Floral" › Cura por turno*, Somar, 2. Vale em todos os ranks (1d4, 1d6, 1d8 e 1d10, todos +2).

### Regras que o sistema garante
- O item soma **depois** das Subclasses e nunca troca o que elas definiram.
- O dado para no **d20**.
- O rank para no **máximo da habilidade** (se a Subclasse já passou dele, o item não puxa para baixo).
- Custos nunca ficam abaixo de 0.
- Nada que mexa em **Prioridade**.
- Dois itens iguais equipados contam **uma vez**.
- A habilidade é reconhecida pelo identificador do compêndio, então continua ligada quando o sistema atualiza e a ficha é re-sincronizada. Se ela não veio do compêndio, a ligação usa o nome.

### O que ainda não dá para mudar
Partes de habilidades que têm a regra escrita direto no código (ex.: o dano do Eco do Ideograma, os metros do Passo Gatuno) e alguns campos passivos (efeitos nos ataques, Efeito vinculado). O que dá e o que não dá em cada habilidade está em `planejamento/itens-modificam-habilidades-0.110.md`, no projeto.

# Gravador

App web para gravar reuniões e conversas, transcrever e resumir. Uso pessoal, protegido por senha.

## Como funciona
- **Gravação:** no próprio iPhone, pelo Safari. A cada 4 minutos o app fecha um trecho e começa outro, sem interromper.
- **Transcrição:** cada trecho é enviado assim que fica pronto ao Groq (modelo Whisper Large V3 Turbo). Ao parar, o texto já está quase todo pronto.
- **Resumo:** botão "Resumir". O texto vai ao Groq (modelo GPT-OSS 120B) e volta como um resumo simples em português.
- **Armazenamento:** áudio e texto ficam só no iPhone, no banco interno do navegador. Nada fica guardado no Netlify nem no Groq.
- **Custo:** cerca de US$ 0,04 por hora de áudio transcrito, mais frações de centavo por resumo.

## Estrutura
```
        index.html            o app (telas, gravação, lista)
        manifest.webmanifest  nome e ícone na tela de início
        icon-*.png            ícones
functions/transcribe.mjs   envia o trecho de áudio ao Groq
functions/summarize.mjs    pede o resumo ao Groq

netlify.toml                 configuração do Netlify
```

## Variáveis de ambiente (Netlify > Site configuration > Environment variables)
| Nome | Valor |
|---|---|
| `GROQ_API_KEY` | chave criada em console.groq.com |
| `APP_PASSWORD` | a senha que você vai digitar no app |

Nunca coloque a chave ou a senha dentro dos arquivos do código.

## Limitações conhecidas
- Se a tela do iPhone bloquear ou outro app for aberto, o iOS interrompe o microfone. O que já foi gravado fica salvo.
- Os dados ficam no aparelho: se apagar os dados do site no Safari ou remover o ícone, as gravações se perdem. Copie ou compartilhe o que quiser guardar.
- Pode faltar uma ou duas palavras na emenda entre os trechos de 4 minutos.

## Como reverter
Para desligar o app, apague o site no Netlify ou remova a variável `GROQ_API_KEY`. Também dá para revogar a chave em console.groq.com > API Keys.

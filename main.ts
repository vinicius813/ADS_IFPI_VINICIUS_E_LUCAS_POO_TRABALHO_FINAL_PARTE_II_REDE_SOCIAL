import * as readline from 'readline';
import * as fs from 'fs';

// Enum para TipoInteracao
enum TipoInteracao {
    Curtir = "curtir",
    NaoCurtir = "não curtir",
    Riso = "riso",
    Surpresa = "surpresa"
}

// Classe Usuario
class Usuario {
    private id: number;
    private email: string;
    private apelido: string;
    private documento: string;
    private ativo: boolean;

    constructor(id: number, email: string, apelido: string, documento: string) {
        this.id = id;
        this.email = email;
        this.apelido = apelido;
        this.documento = documento;
        this.ativo = true;
    }

    public getId(): number {
        return this.id;
    }

    public getEmail(): string {
        return this.email;
    }

    public getApelido(): string {
        return this.apelido;
    }

    public getDocumento(): string {
        return this.documento;
    }

    public isAtivo(): boolean {
        return this.ativo;
    }

    public ativarDesativar(): void {
        this.ativo = !this.ativo;
    }

    public toJSON() {
        return {
            id: this.id,
            email: this.email,
            apelido: this.apelido,
            documento: this.documento,
            ativo: this.ativo
        };
    }

    public static fromJSON(data: any): Usuario {
        const usuario = new Usuario(data.id, data.email, data.apelido, data.documento);
        usuario.ativo = data.ativo;
        return usuario;
    }
}

// Classe Publicacao
class Publicacao {
    private id: number;
    private usuario: Usuario;
    private conteudo: string;
    protected dataHora: Date;

    constructor(id: number, usuario: Usuario, conteudo: string) {
        this.id = id;
        this.usuario = usuario;
        this.conteudo = conteudo;
        this.dataHora = new Date();
    }

    public getId(): number {
        return this.id;
    }

    public getUsuario(): Usuario {
        return this.usuario;
    }

    public getConteudo(): string {
        return this.conteudo;
    }

    public setConteudo(novoConteudo: string): void {
        this.conteudo = novoConteudo;
    }

    public getDataHora(): Date {
        return this.dataHora;
    }

    public toJSON() {
        return {
            id: this.id,
            usuarioId: this.usuario.getId(),
            conteudo: this.conteudo,
            dataHora: this.dataHora,
            tipo: 'simples'
        };
    }

    public static fromJSON(data: any, usuariosMap: Map<number, Usuario>): Publicacao {
        const usuario = usuariosMap.get(data.usuarioId);
        if (usuario) {
            const publicacao = new Publicacao(data.id, usuario, data.conteudo);
            publicacao.dataHora = new Date(data.dataHora);
            return publicacao;
        } else {
            throw new Error('Usuário não encontrado para a publicação.');
        }
    }
}

// Classe Interacao
class Interacao {
    private id: number;
    private publicacao: Publicacao;
    public tipoInteracao: TipoInteracao;
    public usuario: Usuario;
    public dataHora: Date;

    constructor(id: number, publicacao: Publicacao, tipoInteracao: TipoInteracao, usuario: Usuario) {
        this.id = id;
        this.publicacao = publicacao;
        this.tipoInteracao = tipoInteracao;
        this.usuario = usuario;
        this.dataHora = new Date();
    }

    public getPublicacao(): Publicacao {
        return this.publicacao;
    }

    public toJSON() {
        return {
            id: this.id,
            publicacaoId: this.publicacao.getId(),
            tipoInteracao: this.tipoInteracao,
            usuarioId: this.usuario.getId(),
            dataHora: this.dataHora
        };
    }

    public static fromJSON(data: any, usuariosMap: Map<number, Usuario>, publicacao: Publicacao): Interacao {
        const usuario = usuariosMap.get(data.usuarioId);
        if (usuario) {
            const interacao = new Interacao(data.id, publicacao, data.tipoInteracao, usuario);
            interacao.dataHora = new Date(data.dataHora);
            return interacao;
        } else {
            throw new Error('Usuário não encontrado para a interação.');
        }
    }
}

// Classe PublicacaoAvancada que herda de Publicacao
class PublicacaoAvancada extends Publicacao {
    private interacoes: Interacao[];

    constructor(id: number, usuario: Usuario, conteudo: string) {
        super(id, usuario, conteudo);
        this.interacoes = [];
    }

    public adicionarInteracao(interacao: Interacao): void {
        this.interacoes.push(interacao);
    }

    public getInteracoes(): Interacao[] {
        return this.interacoes;
    }

    public toJSON() {
        return {
            id: this.getId(),
            usuarioId: this.getUsuario().getId(),
            conteudo: this.getConteudo(),
            dataHora: this.getDataHora(),
            tipo: 'avancada',
            interacoes: this.interacoes.map(interacao => interacao.toJSON())
        };
    }

    public static fromJSON(data: any, usuariosMap: Map<number, Usuario>): PublicacaoAvancada {
        const usuario = usuariosMap.get(data.usuarioId);
        if (usuario) {
            const publicacao = new PublicacaoAvancada(data.id, usuario, data.conteudo);
            publicacao.dataHora = new Date(data.dataHora);
            data.interacoes.forEach((interacaoData: any) => {
                const interacao = Interacao.fromJSON(interacaoData, usuariosMap, publicacao);
                publicacao.adicionarInteracao(interacao);
            });
            return publicacao;
        } else {
            throw new Error('Usuário não encontrado para a publicação.');
        }
    }
}

// Classe RedeSocial
class RedeSocial {
    private usuarios: Map<number, Usuario> = new Map();
    private publicacoes: Map<number, Publicacao> = new Map();

    // Método para cadastrar usuário
    public cadastrarUsuario(usuario: Usuario): void {
        if (this.usuarios.has(usuario.getId())) {
            throw new Error("Usuário com este ID já cadastrado.");
        }
        
        if ([...this.usuarios.values()].some(u => u.getEmail() === usuario.getEmail())) {
            throw new Error("E-mail já cadastrado.");
        }

        this.usuarios.set(usuario.getId(), usuario);
        console.log("Usuário cadastrado com sucesso!");
    }

    // Método para cadastrar publicação
    public cadastrarPublicacao(publicacao: Publicacao): void {
        if (this.publicacoes.has(publicacao.getId())) {
            throw new Error("Publicação com este ID já cadastrada.");
        }

        this.publicacoes.set(publicacao.getId(), publicacao);
        console.log("Publicação cadastrada com sucesso!");
    }

    // Métodos para consulta
    public consultarUsuarios(): Usuario[] {
        return [...this.usuarios.values()];
    }

    public consultarPublicacoes(): Publicacao[] {
        return [...this.publicacoes.values()];
    }

    // Método para ativar/desativar usuário
    public ativarDesativarUsuario(usuarioId: number): void {
        const usuario = this.usuarios.get(usuarioId);
        if (usuario) {
            usuario.ativarDesativar();
            console.log(`Usuário ${usuario.isAtivo() ? 'ativado' : 'desativado'} com sucesso!`);
        } else {
            throw new Error("Usuário não encontrado.");
        }
    }

    // Método para editar publicação
    public editarPublicacao(publicacaoId: number, novoConteudo: string): void {
        const publicacao = this.publicacoes.get(publicacaoId);
        if (publicacao) {
            publicacao.setConteudo(novoConteudo);
            console.log("Publicação editada com sucesso!");
        } else {
            throw new Error("Publicação não encontrada.");
        }
    }

    // Método para adicionar interação
    public adicionarInteracao(interacao: Interacao): void {
        const publicacao = interacao.getPublicacao();
        if (publicacao instanceof PublicacaoAvancada) {
            publicacao.adicionarInteracao(interacao);
            this.notificarUsuarios(interacao);
            console.log("Interação adicionada com sucesso!");
        } else {
            throw new Error("Interação não pode ser adicionada a esta publicação.");
        }
    }

    // Método para notificar usuários sobre novas interações
    private notificarUsuarios(interacao: Interacao): void {
        const publicacao = interacao.getPublicacao();
        const usuarioPublicacao = publicacao.getUsuario();
        console.log(`Notificando usuário ${usuarioPublicacao.getApelido()} sobre nova interação do tipo ${interacao.tipoInteracao} na sua publicação.`);
    }

    // Método para salvar dados em arquivo JSON
    public salvarDados(): void {
        const data = {
            usuarios: [...this.usuarios.values()].map(usuario => usuario.toJSON()),
            publicacoes: [...this.publicacoes.values()].map(publicacao => publicacao.toJSON())
        };
        fs.writeFileSync('redeSocialData.json', JSON.stringify(data, null, 2));
        console.log("Dados salvos com sucesso!");
    }

    // Método para carregar dados de arquivo JSON
    public carregarDados(): void {
        if (fs.existsSync('redeSocialData.json')) {
            const dataStr = fs.readFileSync('redeSocialData.json', 'utf8');
            const data = JSON.parse(dataStr);
            data.usuarios.forEach((usuarioData: any) => {
                const usuario = Usuario.fromJSON(usuarioData);
                this.usuarios.set(usuario.getId(), usuario);
            });
            data.publicacoes.forEach((publicacaoData: any) => {
                if (publicacaoData.tipo === 'avancada') {
                    const publicacao = PublicacaoAvancada.fromJSON(publicacaoData, this.usuarios);
                    this.publicacoes.set(publicacao.getId(), publicacao);
                } else {
                    const publicacao = Publicacao.fromJSON(publicacaoData, this.usuarios);
                    this.publicacoes.set(publicacao.getId(), publicacao);
                }
            });
            console.log("Dados carregados com sucesso!");
        }
    }
}

// Função para exibir o menu e capturar a escolha do usuário
function exibirMenu(redeSocial: RedeSocial) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
  
    const menuTexto = `
Menu:
1. Cadastrar Usuário
2. Cadastrar Publicação
3. Consultar Usuários
4. Consultar Publicações
5. Editar Publicação
6. Ativar/Desativar Usuário
7. Adicionar Interação
8. Sair
Escolha uma opção (1-8): `;
  
    const perguntarMenu = () => {
        rl.question(menuTexto, async (opcao) => {
            try {
                switch (opcao) {
                    case '1':
                        await cadastrarUsuario(rl, redeSocial);
                        break;
                    case '2':
                        await cadastrarPublicacao(rl, redeSocial);
                        break;
                    case '3':
                        consultarUsuarios(redeSocial);
                        break;
                    case '4':
                        consultarPublicacoes(redeSocial);
                        break;
                    case '5':
                        await editarPublicacao(rl, redeSocial);
                        break;
                    case '6':
                        await ativarDesativarUsuario(rl, redeSocial);
                        break;
                    case '7':
                        await adicionarInteracao(rl, redeSocial);
                        break;
                    case '8':
                        console.log("Saindo...");
                        rl.close();
                        return;
                    default:
                        console.log("Opção inválida! Tente novamente.");
                }
            } catch (error: any) {
                console.error(error.message);
            }
            perguntarMenu(); // Pergunta novamente após cada ação
        });
    };
  
    perguntarMenu();
}

// Função para cadastrar um usuário
async function cadastrarUsuario(rl: readline.Interface, redeSocial: RedeSocial) {
    return new Promise<void>((resolve) => {
        rl.question("Digite o ID do usuário: ", (idStr) => {
            const id = parseInt(idStr);
            rl.question("Digite o email do usuário: ", (email) => {
                rl.question("Digite o apelido do usuário: ", (apelido) => {
                    rl.question("Digite o documento do usuário: ", (documento) => {
                        const usuario = new Usuario(id, email, apelido, documento);
                        try {
                            redeSocial.cadastrarUsuario(usuario);
                            redeSocial.salvarDados();
                        } catch (error: any) {
                            console.error(error.message);
                        }
                        resolve();
                    });
                });
            });
        });
    });
}

// Função para cadastrar uma publicação
async function cadastrarPublicacao(rl: readline.Interface, redeSocial: RedeSocial) {
    return new Promise<void>((resolve) => {
        rl.question("Digite o ID da publicação: ", (idStr) => {
            const id = parseInt(idStr);
            rl.question("Digite o ID do usuário que está criando a publicação: ", (usuarioIdStr) => {
                const usuarioId = parseInt(usuarioIdStr);
                const usuario = redeSocial.consultarUsuarios().find(u => u.getId() === usuarioId);
  
                if (!usuario) {
                    console.log("Usuário não encontrado!");
                    resolve();
                    return; // Sai da função se o usuário não for encontrado
                }
  
                rl.question("Digite o conteúdo da publicação: ", (conteudo) => {
                    rl.question("Digite o tipo de publicação (1 - Simples, 2 - Avançada): ", (tipoStr) => {
                        let publicacao;
                        if (tipoStr === '1') {
                            publicacao = new Publicacao(id, usuario, conteudo);
                        } else if (tipoStr === '2') {
                            publicacao = new PublicacaoAvancada(id, usuario, conteudo);
                        } else {
                            console.log("Tipo de publicação inválido!");
                            resolve();
                            return;
                        }
                        try {
                            redeSocial.cadastrarPublicacao(publicacao);
                            redeSocial.salvarDados();
                        } catch (error: any) {
                            console.error(error.message);
                        }
                        resolve();
                    });
                });
            });
        });
    });
}

// Função para consultar usuários
function consultarUsuarios(redeSocial: RedeSocial) {
    const usuarios = redeSocial.consultarUsuarios();
    if (usuarios.length === 0) {
        console.log("Nenhum usuário cadastrado.");
        return;
    }
    console.log("Usuários cadastrados:");
    usuarios.forEach(usuario => {
        console.log(`ID: ${usuario.getId()}, Apelido: ${usuario.getApelido()}, Email: ${usuario.getEmail()}, Ativo: ${usuario.isAtivo() ? 'Sim' : 'Não'}`);
    });
}

// Função para consultar publicações
function consultarPublicacoes(redeSocial: RedeSocial) {
    const publicacoes = redeSocial.consultarPublicacoes();
    if (publicacoes.length === 0) {
        console.log("Nenhuma publicação cadastrada.");
        return;
    }
    console.log("Publicações cadastradas:");
    publicacoes.forEach(publicacao => {
        console.log(`ID: ${publicacao.getId()}, Usuário ID: ${publicacao.getUsuario().getId()}, Conteúdo: ${publicacao.getConteudo()}, Tipo: ${publicacao instanceof PublicacaoAvancada ? 'Avançada' : 'Simples'}`);
        if (publicacao instanceof PublicacaoAvancada) {
            console.log("Interações:");
            publicacao.getInteracoes().forEach(interacao => {
                console.log(` - Usuário ID: ${interacao.usuario.getId()}, Tipo de Interação: ${interacao.tipoInteracao}`);
            });
        }
    });
}

// Função para editar publicação
async function editarPublicacao(rl: readline.Interface, redeSocial: RedeSocial) {
    return new Promise<void>((resolve) => {
        rl.question("Digite o ID da publicação a editar: ", (idStr) => {
            const id = parseInt(idStr);
            rl.question("Digite o novo conteúdo da publicação: ", (novoConteudo) => {
                try {
                    redeSocial.editarPublicacao(id, novoConteudo);
                    redeSocial.salvarDados();
                } catch (error: any) {
                    console.error(error.message);
                }
                resolve();
            });
        });
    });
}

// Função para ativar/desativar usuário
async function ativarDesativarUsuario(rl: readline.Interface, redeSocial: RedeSocial) {
    return new Promise<void>((resolve) => {
        rl.question("Digite o ID do usuário a ativar/desativar: ", (idStr) => {
            const id = parseInt(idStr);
            try {
                redeSocial.ativarDesativarUsuario(id);
                redeSocial.salvarDados();
            } catch (error: any) {
                console.error(error.message);
            }
            resolve();
        });
    });
}

// Função para adicionar interação
async function adicionarInteracao(rl: readline.Interface, redeSocial: RedeSocial) {
    return new Promise<void>((resolve) => {
        rl.question("Digite o ID da publicação a interagir: ", (publicacaoIdStr) => {
            const publicacaoId = parseInt(publicacaoIdStr);
            const publicacao = redeSocial.consultarPublicacoes().find(p => p.getId() === publicacaoId);

            if (!publicacao) {
                console.log("Publicação não encontrada!");
                resolve();
                return;
            }

            if (!(publicacao instanceof PublicacaoAvancada)) {
                console.log("Esta publicação não suporta interações.");
                resolve();
                return;
            }

            rl.question("Digite o ID do usuário que está interagindo: ", (usuarioIdStr) => {
                const usuarioId = parseInt(usuarioIdStr);
                const usuario = redeSocial.consultarUsuarios().find(u => u.getId() === usuarioId);

                if (!usuario) {
                    console.log("Usuário não encontrado!");
                    resolve();
                    return;
                }

                console.log("Tipos de Interação:");
                console.log("1. Curtir");
                console.log("2. Não Curtir");
                console.log("3. Riso");
                console.log("4. Surpresa");
                rl.question("Escolha um tipo de interação (1-4): ", (tipoInteracaoStr) => {
                    let tipoInteracao: TipoInteracao;
                    switch (tipoInteracaoStr) {
                        case '1':
                            tipoInteracao = TipoInteracao.Curtir;
                            break;
                        case '2':
                            tipoInteracao = TipoInteracao.NaoCurtir;
                            break;
                        case '3':
                            tipoInteracao = TipoInteracao.Riso;
                            break;
                        case '4':
                            tipoInteracao = TipoInteracao.Surpresa;
                            break;
                        default:
                            console.log("Tipo de interação inválido!");
                            resolve();
                            return;
                    }

                    const interacaoId = Date.now(); // Simple way to generate unique IDs
                    const interacao = new Interacao(interacaoId, publicacao, tipoInteracao, usuario);

                    try {
                        redeSocial.adicionarInteracao(interacao);
                        redeSocial.salvarDados();
                    } catch (error: any) {
                        console.error(error.message);
                    }
                    resolve();
                });
            });
        });
    });
}

// Inicialização da aplicação
const redeSocial = new RedeSocial();
redeSocial.carregarDados();
exibirMenu(redeSocial);
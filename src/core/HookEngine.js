/**
 * HookEngine — Motor de Actions e Filters inspirado no WordPress,
 * desenhado com suporte assíncrono (async/await) e isolamento de falhas (sandbox lógica).
 */
export class HookEngine {
  constructor() {
    this.actions = new Map();
    this.filters = new Map();
    this.errors = [];
  }

  /**
   * Registra uma Action (efeito colateral que não altera o valor principal).
   * @param {string} hookName Nome do gancho (ex: 'post:published')
   * @param {Function} callback Função síncrona ou assíncrona
   * @param {number} priority Ordem de execução (menor roda primeiro, padrão = 10)
   * @param {string} pluginId Identificador do plugin para auditoria e remoção
   */
  addAction(hookName, callback, priority = 10, pluginId = 'core') {
    if (typeof callback !== 'function') {
      throw new TypeError(`Callback para action "${hookName}" deve ser uma função.`);
    }
    if (!this.actions.has(hookName)) {
      this.actions.set(hookName, []);
    }
    const listeners = this.actions.get(hookName);
    listeners.push({ callback, priority: Number(priority) || 10, pluginId });
    listeners.sort((a, b) => a.priority - b.priority);
    return () => this.removePluginHooks(pluginId, hookName);
  }

  /**
   * Executa todas as Actions registradas para um gancho em ordem de prioridade.
   */
  async doAction(hookName, ...args) {
    const listeners = this.actions.get(hookName) || [];
    for (const item of listeners) {
      try {
        await item.callback(...args);
      } catch (err) {
        this._recordError('action', hookName, item.pluginId, err);
      }
    }
  }

  /**
   * Registra um Filter (transforma um dado em cascata).
   * @param {string} hookName Nome do filtro (ex: 'post:before_save')
   * @param {Function} callback Função que recebe (value, ...args) e retorna o novo value
   * @param {number} priority Ordem de execução (menor roda primeiro, padrão = 10)
   * @param {string} pluginId Identificador do plugin
   */
  addFilter(hookName, callback, priority = 10, pluginId = 'core') {
    if (typeof callback !== 'function') {
      throw new TypeError(`Callback para filter "${hookName}" deve ser uma função.`);
    }
    if (!this.filters.has(hookName)) {
      this.filters.set(hookName, []);
    }
    const listeners = this.filters.get(hookName);
    listeners.push({ callback, priority: Number(priority) || 10, pluginId });
    listeners.sort((a, b) => a.priority - b.priority);
    return () => this.removePluginHooks(pluginId, hookName);
  }

  /**
   * Passa um valor por todos os Filters registrados em cascata.
   * Proteção nativa: se um plugin lançar erro ou retornar `undefined`, o valor anterior é preservado.
   */
  async applyFilters(hookName, initialValue, ...extraArgs) {
    const listeners = this.filters.get(hookName) || [];
    let currentValue = initialValue;

    for (const item of listeners) {
      try {
        const result = await item.callback(currentValue, ...extraArgs);
        if (result !== undefined) {
          currentValue = result;
        }
      } catch (err) {
        this._recordError('filter', hookName, item.pluginId, err);
      }
    }
    return currentValue;
  }

  /**
   * Remove todos os ganchos associados a um plugin (útil ao desativar plugin em runtime).
   */
  removePluginHooks(pluginId, specificHook = null) {
    const cleanMap = (map) => {
      for (const [hook, list] of map.entries()) {
        if (specificHook && hook !== specificHook) continue;
        map.set(
          hook,
          list.filter((item) => item.pluginId !== pluginId)
        );
      }
    };
    cleanMap(this.actions);
    cleanMap(this.filters);
  }

  _recordError(type, hookName, pluginId, err) {
    const entry = {
      timestamp: new Date().toISOString(),
      type,
      hookName,
      pluginId,
      message: err?.message || String(err)
    };
    this.errors.push(entry);
    if (this.errors.length > 100) this.errors.shift();
    console.error(`[HookEngine][Plugin:${pluginId}] Erro no ${type} "${hookName}":`, err);
  }
}

export const cms = new HookEngine();

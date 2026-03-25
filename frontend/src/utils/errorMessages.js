export function getFriendlyError(error, fallbackMessage = 'Nao foi possivel concluir a operacao.') {
  const rawMessage = typeof error?.message === 'string' ? error.message : '';
  if (!rawMessage) return fallbackMessage;

  const message = rawMessage.toLowerCase();

  if (message.includes('token') || message.includes('unauthorized') || message.includes('401')) {
    return 'Sua sessao expirou. Faca login novamente.';
  }

  if (message.includes('network') || message.includes('failed to fetch')) {
    return 'Nao foi possivel conectar ao servidor. Verifique a internet e tente novamente.';
  }

  if (message.includes('nao encontrado') || message.includes('not found') || message.includes('404')) {
    return 'Nao encontramos o recurso solicitado.';
  }

  if (message.includes('invalido') || message.includes('invalid') || message.includes('400')) {
    return 'Dados invalidos. Revise as informacoes e tente novamente.';
  }

  if (message.includes('negado') || message.includes('forbidden') || message.includes('403')) {
    return 'Você não tem permissão para executar essa ação.';
  }

  return rawMessage;
}

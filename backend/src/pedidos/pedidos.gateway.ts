import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class PedidosGateway {
  @WebSocketServer()
  server: Server;

  emitNovoPedido(pedido: unknown) {
    this.server.emit('novo_pedido', pedido);
  }

  emitPedidoAtualizado(pedido: unknown) {
    this.server.emit('pedido_atualizado', pedido);
  }
}

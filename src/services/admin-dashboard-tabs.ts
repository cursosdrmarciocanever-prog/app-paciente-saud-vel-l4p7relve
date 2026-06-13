import pb from '@/lib/pocketbase/client'

export async function getFotosDashboard() {
  return await pb.collection('fotos_paciente').getFullList({
    expand: 'usuario_id',
    sort: '-created',
  })
}

export async function getExamesDashboard() {
  return await pb.collection('exames_pdf').getFullList({
    expand: 'usuario_id',
    sort: '-data_exame',
  })
}

export async function getBioimpedanciaDashboard() {
  return await pb.collection('bioimpedancia_pdf').getFullList({
    expand: 'usuario_id',
    sort: '-data_medicao',
  })
}

export async function getPedidosDashboard() {
  return await pb.collection('pedidos_injetaveis').getFullList({
    expand: 'usuario_id,injetavel_id',
    sort: '-created',
  })
}

export async function updatePedidoStatus(id: string, status: string) {
  return await pb.collection('pedidos_injetaveis').update(id, { status })
}

export async function deleteAdminRecord(collection: string, id: string) {
  return await pb.collection(collection).delete(id)
}

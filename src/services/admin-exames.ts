import pb from '@/lib/pocketbase/client'

export function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export const getExames = async (page: number, searchTerm: string, typeFilter: string) => {
  const filters = []
  if (typeFilter && typeFilter !== 'todos') {
    filters.push(`tipo_exame = "${typeFilter}"`)
  }
  if (searchTerm) {
    filters.push(`(usuario_id.name ~ "${searchTerm}" || usuario_id.email ~ "${searchTerm}")`)
  }

  const filter = filters.length > 0 ? filters.join(' && ') : ''

  return pb.collection('exames_pdf').getList(page, 20, {
    filter,
    sort: '-created',
    expand: 'usuario_id',
  })
}

export const searchUsers = async (search: string) => {
  return pb.collection('users').getList(1, 20, {
    filter: search ? `name ~ "${search}" || email ~ "${search}"` : '',
    sort: 'name',
  })
}

export const deleteExame = async (id: string) => {
  return pb.collection('exames_pdf').delete(id)
}

export const getFileUrl = (record: any) => {
  return pb.files.getURL(record, record.arquivo)
}

export const createExameWithProgress = (
  data: any,
  onProgress: (pct: number) => void,
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const formData = new FormData()
    formData.append('usuario_id', data.usuario_id)
    formData.append('nome_exame', data.nome_exame)
    formData.append('tipo_exame', data.tipo_exame)

    // Convert YYYY-MM-DD to ISO UTC mid-day to avoid timezone shifting backwards
    const [y, m, d] = data.data_exame.split('-')
    const date = new Date(Number(y), Number(m) - 1, Number(d), 12, 0, 0)
    formData.append('data_exame', date.toISOString())

    formData.append('arquivo', data.arquivo)
    formData.append('tamanho_bytes', data.arquivo.size.toString())

    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${pb.baseUrl}/api/collections/exames_pdf/records`)
    xhr.setRequestHeader('Authorization', pb.authStore.token)

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText))
      } else {
        try {
          const err = JSON.parse(xhr.responseText)
          reject(
            new Error(err.message || 'Erro ao enviar arquivo. Verifique o tamanho do arquivo.'),
          )
        } catch {
          reject(new Error('Erro inesperado ao enviar arquivo.'))
        }
      }
    }

    xhr.onerror = () => reject(new Error('Erro de rede ao enviar arquivo.'))

    xhr.send(formData)
  })
}

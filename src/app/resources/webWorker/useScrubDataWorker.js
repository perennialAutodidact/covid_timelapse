import { useEffect, useState, useMemo } from 'react'
import { wrap, releaseProxy } from 'comlink'

export const makeWorkerApiAndCleanup = () => {
  const worker = new Worker('./scrubData.js', { type: 'module' })

  const workerApi = wrap(worker)

  const cleanup = () => {
    workerApi[releaseProxy]()
    worker.terminate()
  }

  const workerApiAndCleanup = { workerApi, cleanup }

  return workerApiAndCleanup
}

export const useWorker = () => {
  const workerApiAndCleanup = useMemo(() => makeWorkerApiAndCleanup(), [])

  useEffect(() => {
    const { cleanup } = workerApiAndCleanup

    return () => {
      cleanup()
    }
  }, [workerApiAndCleanup])

  return workerApiAndCleanup
}

const useScrubDataWorker = (date, rawData) => {
  const [data, setData] = useState({
    isLoading: false,
    results: []
  })
  const { workerApi } = useWorker()
  useEffect(() => {
    setData({ isLoading: true, results: [] })

    workerApi
      .scrubData(rawData)
      .then(results => setData({ isLoading: false, results: results }))
  }, [workerApi, rawData])

  return data
}

export default useScrubDataWorker

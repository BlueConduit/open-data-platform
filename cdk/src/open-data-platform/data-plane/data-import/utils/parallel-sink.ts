import { Transform } from 'stream';
import internal = require('stream');
const { finished } = require('node:stream');

/**
 * Returns a stream transformer that executes the handler promise for each item<T>
 * in the stream, while allowing at maximum `maxConcurrency` promises to be executed in 
 * parallel.
 * @param maxConcurrency The number of promises we can allow to be executed in parallel
 * @param dataHandler What to do with each item in the stream
 * @returns a transformer of type stream.Transform.
 */
export const ParallelSink = <T>(
    maxConcurrency: number,
    dataHandler: (arg: T) => Promise<any>, // what to do with data we receive. 
    errorHandler: (e: Error, arg: T) => any, // what to do with errors.
    finishHandler: () => any, // what to do once the last chunk has been processed. 
) => {
  // The number of chunks we have written to the 'sink' as promises, but have not yet
  // resolved or rejected. 
  let inflightCount = 0;

  // Invoked once the final promise has resolved. 
  let streamEndAckCb: internal.TransformCallback | null = null;

  // Items from the source stream that have not yet been written as promises. In theory
  // there should only be one item here at max but NodeJS doesn't give that to us as an
  // invariant so we use an array just in case there are more.
  const queue: [T, internal.TransformCallback][] = [];

  // 1. safely pull an item from the queue and start working on it
  // 2. Invoke a next() to invite another item in from the source
  // 3. If we're all done, invoke the finishHandler and ack the flush next().
  const safelyDequeue = () => {
    inflightCount--;
    while(queue.length && inflightCount < maxConcurrency){
      const dataAndNext = queue.shift();
      if(!dataAndNext) break;
      const [data, next] = dataAndNext;
      inflightCount++;
      next();
      dataHandler(data)
      .catch((e: Error) => errorHandler(e, data))
      .finally(safelyDequeue);
    }

    if(streamEndAckCb !== null && inflightCount === 0){
      console.log('Sink flushed.');
      streamEndAckCb();
      finishHandler();
    }
  };

  const result = new Transform({
    // NodeJS Streams are usually string/buffer only. objectMode: true signifies that
    // the objects operated on will *always* fit in memory and bypasses internal checks
    // that stream arguments must be strings/buffers. 
    // See: https://nodejs.org/api/stream.html#object-mode
    objectMode: true,

    // Called on every new chunk of data of type T. Invoking next() signals to the source
    // stream that this module is 'ready' to receive more data. 
    transform(data: T, _, next) {
      if(inflightCount < maxConcurrency){
        inflightCount++;
        next();
        // This 'loose' promise should be ok because we will always invoke next() as part
        // of safelyDequeue() when it resolves. 
        dataHandler(data)
        .catch((e: Error) => errorHandler(e, data))
        .then(safelyDequeue);
      } else {
        queue.push([data, next]);
      }
    },

    // Called once the source stream has run out of data to provide. Only invoke cb()
    // when we are ready to send a steam.end() signal to whomever is listening for it.
    flush(done) {
      if(queue.length || inflightCount){
        streamEndAckCb = done;
      } else {
        done();
      }
    }
  });

  // Ensure the finishHandler gets called even if the stream closes prematurely
  // See: https://nodejs.org/api/stream.html#streamfinishedstream-options-callback
  finished(result, finishHandler);
  
  return result;
};

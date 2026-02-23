import {sileo} from "sileo";

class ErrorHandler {
  description: string;
  type: string;
  errors: string;

  constructor(error: any) {
    let message;
    let errors = null;
    let type = 'info';
    const response = error.response;

    if (response) {
      switch (response.status) {
        case 400:
          type = 'warning';
          break;
        case 204:
          type = 'warning';
          break;
        case 500:
        case 405:
          type = 'error';
          break;
        default:
          //do nothing;
          break;
      }
      if (!(typeof response.data === 'object')) {
        message = response.statusText;
      } else {
        if (response.data.message) {
          message = response.data.message;
        } else {
          message = response.data.error;
        }
        errors = response.data.errors;
      }
    } else {
      if (typeof error === 'string') {
        message = error;
      } else {
        message = error.message;
      }
    }

    this.description = message;
    this.type = type;
    this.errors = errors;
  }

  async getBlobError(error: any) {
    const status = await error.response.data.text();
    const st = JSON.parse(status);
    this.description = st?.error;
  }

  static showNotification(error: any, time = 3) {
    if (error.message === undefined) return;
    const handler = new ErrorHandler(error);
    if (error.response) {
      if (error.response.config.responseType === 'blob') {
        handler.getBlobError(error).then(() => {
          handler.show(time);
        });
      } else {
        handler.show(time);
      }
    } else {
      handler.show(time);
    }
  }

  show(time?: number, returnOptions: boolean = false) :any{
    const options = {
      title: 'Ocurrio un problema',
      duration: time ? time * 1000 : undefined,
      description: (
        <div className={'toast-content'}>
          <div>{this.description}</div>
          {this.errors && Object.keys(this.errors).map((key: string, indexA) => {
            return (
              <div key={'p_' + indexA}>
                <strong>{key}</strong>
                <ul style={{paddingLeft: 16}}>
                  {/*@ts-ignore */}
                  {this.errors[key].map((msg, indexB) => (
                    <li key={`${indexA}_${indexB}`}>{msg}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      ),
    };

    if (returnOptions) return options;

    switch (this.type) {
      case 'error':
        sileo.error(options);
        break;
      case 'warning':
        sileo.warning(options);
        break;
      default:
        sileo.info(options);
    }
  }
}

export default ErrorHandler;

import loadingTemplate from '../template/loading.html'

const LoadingView = Mn.ItemView.extend({
  className: 'loading',
  template: _.template(loadingTemplate),
  ui: {
    spinner: '.spinner',
    warn: '.warn',
    error: '.error'
  },

  warn (msg) {
    this.ui.spinner.removeClass('hidden')
    this.ui.error.addClass('hidden')
    this.ui.warn.removeClass('hidden').html(msg)
  },

  error () {
    this.ui.spinner.addClass('hidden')
    this.ui.warn.addClass('hidden')
    this.ui.error.removeClass('hidden')
  }
})

export default LoadingView

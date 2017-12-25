import coverTemplate from '../template/cover.html'

const SearchResultsCoverView = Mn.ItemView.extend({
  className: 'cover',
  template: _.template(coverTemplate),
  ui: {
    download: '.fa-download',
    image: '.cover-img'
  },
  events: {
    'click @ui.download': 'download',
    'mousemove @ui.download': 'reset',
    'load @ui.image': 'onload'
  },

  onRender () {
    this.ui.image.on('load', _.bind(this.onload, this))
  },

  download (e) {
    this.ui.download.addClass('downloading')
  },

  reset () {
    this.ui.download.removeClass('downloading')
  },

  onload () {
    _.delay(() => {
      this.$el.addClass('loaded')
    }, _.random(200, 400))
  }
})

export default SearchResultsCoverView

const Layout = Mn.LayoutView.extend({
  el: 'body',
  regions: {
    searchForm: '#search-form-region',
    message: '#message-region',
    searchResultsCovers: '#search-results-covers-region'
  }
})

export default Layout

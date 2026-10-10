source "https://rubygems.org"

# Jekyll 4 directly, instead of the `github-pages` meta-gem.
#
# Why: `github-pages` pinned a set of old gems we could not control
# (its dependency jekyll-remote-theme caps rubyzip at < 3.0, which kept a
# high-severity Dependabot alert permanently open). The site is built by
# GitHub Actions now, so the repo's Gemfile.lock is authoritative.
gem "jekyll", "~> 4.4"

# Plugin enabled in _config.yml.
gem "jekyll-sitemap"

# No longer bundled with Ruby 3.4+; Jekyll (and `jekyll serve`) need them.
gem "webrick"
gem "csv"
gem "logger"

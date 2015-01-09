require 'sass'
require 'base64'
require 'cgi'

module Sass::Script::Functions
	def url_encode(path)
		real_path = File.join(Compass.configuration.images_path, path.value)
		svg = data(real_path)
		encoded_svg = CGI::escape(svg).gsub('+', '%20')
		Sass::Script::String.new(encoded_svg)
#		data_url = "url('data:image/svg+xml;charset=utf-8," + encoded_svg + "')"
#		Sass::Script::String.new(data_url)
	end
    declare :url_encode, :args => [:path]

    def base64_encode(path)
#		assert_type string, :string
		real_path = File.join(Compass.configuration.images_path, path.value)
		svg = data(real_path)
		encoded_svg = Base64.encode64(svg)
		Sass::Script::String.new(encoded_svg)
    end
    declare :base64_encode, :args => [:path]

private

	def data(real_path)
		if File.readable?(real_path)
			File.open(real_path, "rb") {|io| io.read}
		else
			raise Compass::Error, "File not found or cannot be read: #{real_path}"
		end
	end

end

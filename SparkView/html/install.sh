#!/bin/sh

set -e

file_name="agent_setup.tar.gz"
download_url="https://www.remotespark.com/view/${file_name}"
bin_dir="/usr/local/bin"
target_dir="SparkAgent"
install_dir="${bin_dir}/${target_dir}"

download_dir="${TMPDIR:-/tmp}"
mkdir -p ${download_dir} # make sure folder exists
local_file="${download_dir}/${file_name}" # the file path should be download

echo "Downloading ${download_url} to ${local_file}"
rm -f ${local_file}
curl -k --fail --location --output "${local_file}" "${download_url}"

echo "Extacting ${local_file} to ${install_dir}"
mkdir -p "${install_dir}"
tar -xzvf ${local_file} -C "${install_dir}"

echo "Create symlink ${install_dir}/sg_agent in /usr/bin/"
ln -s "${install_dir}/sg_agent" "/usr/bin/"
sg_agent reverse --help

exit 0
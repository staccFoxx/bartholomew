class BtpGuard < Formula
  desc "Deterministic in-process AST security runtime and AI agent execution firewall"
  homepage "https://bartholomew.info"
  url "https://github.com/staccFoxx/bartholomew/archive/refs/tags/v6.6.7.tar.gz"
  version "6.6.7"
  license "Apache-2.0"

  depends_on "python@3.12"
  depends_on "node" => :optional

  def install
    system "python3", "-m", "pip", "install", *std_pip_args, "."
  end

  test do
    system "#{bin}/btp-guard", "--version"
  end
end

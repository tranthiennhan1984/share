namespace Binean.Foundation.Storage {
    public sealed class ReaderToken : ReadableToken {
        private readonly ReadableToken _rootToken;
        private readonly Reader _reader;
        private readonly Action? _disposedAction;

        public ReaderToken(ref TokenReader tokenReader, Reader reader, int level, int index, string? name = null, bool leaveOpen = false, ReadableToken? rootToken = null)
            : base(tokenReader, level, index, TokenType.BeginArray, null, name) {
            _reader = reader;
            _disposedAction = leaveOpen ? null : _reader.Dispose;

            _rootToken = rootToken ?? this;

            var token = _reader.Read();

            if (Value == null && token.Value != null) Value = token.Value;
            if (string.IsNullOrWhiteSpace(Name) && !string.IsNullOrWhiteSpace(token.Name)) Name = token.Name;

            if (!token.IsData) {
                _disposedAction?.Invoke();
                Type = TokenType.Value;
                return;
            }

            Type = token.Type;
            if (token.IsBlock) {
                tokenReader = FirstRead;
            } else {
                _disposedAction?.Invoke();
            }
        }

        private Token FirstRead(Reader reader, Token block, ref TokenReader tokenReader) {
            tokenReader = ReadItem;
            return ReadItem(reader, block, ref tokenReader);
        }

        private Token EndRead(Reader reader, Token block, ref TokenReader tokenReader) {
            _disposedAction?.Invoke();
            return _rootToken.ReadEndBlock(reader, block, ref tokenReader);
        }

        private Token ReadItem(Reader reader, Token block, ref TokenReader tokenReader) {
            var retVal = _reader.Read();
            if ((retVal.IsEndBlock || retVal.IsEof) && (block == (_rootToken ?? this))) {
                return EndRead(reader, block, ref tokenReader);
            }
            return block.NewItem(retVal.Type, retVal.Value, retVal.Name);
        }
    }
}

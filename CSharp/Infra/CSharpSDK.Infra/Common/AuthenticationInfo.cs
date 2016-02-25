using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lucca.CSharpSDK.Infra.Common
{
	public enum AuthenticationType { User, Application };

	public class AuthenticationInfo
	{
		public AuthenticationType Type { get; private set; }
		public Guid Token { get; private set; }

		public AuthenticationInfo(AuthenticationType type, Guid token)
		{
			Type = type;
			Token = token;
		}
		public AuthenticationInfo(AuthenticationType type, string token)
			: this(type, new Guid(token)) { }
	}
}

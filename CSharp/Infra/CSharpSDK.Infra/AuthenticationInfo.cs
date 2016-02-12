using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lucca.CSharpSDK.Infra
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
	}
}

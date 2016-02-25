using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lucca.CSharpSDK.Domain
{
	public interface IPermissionsService
	{
		bool HasUserPermission(int appInstanceID, int operationID);
	}
}

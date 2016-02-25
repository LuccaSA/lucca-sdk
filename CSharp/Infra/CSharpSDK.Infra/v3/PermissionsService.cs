using Lucca.CSharpSDK.Domain;
using Lucca.CSharpSDK.Domain.Models.Rights;
using Lucca.CSharpSDK.Infra.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lucca.CSharpSDK.Infra.v3
{
	public class PermissionsService : ApiService<Permission>, IPermissionsService
    {
		public PermissionsService(ApiSettings settings)
			: base(settings)
		{
			_baseUri = new Uri(settings.InstanceUri, "/api/v3/permissions");
		}

		public bool HasUserPermission(int appInstanceID, int operationID)
		{
			throw new Exception("v3 API does not support HasUserPermission yet, please retry with v2");
		}
	}
}

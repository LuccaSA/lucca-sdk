using Lucca.CSharpSDK.Domain;
using Lucca.CSharpSDK.Domain.Models.Rights;
using Lucca.CSharpSDK.Infra.Common;
using RDD.Domain.Models.Querying;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lucca.CSharpSDK.Infra.v2
{
	public class PermissionsService : ApiService<Permission>, IPermissionsService
    {
		public PermissionsService(ApiSettings settings)
			: base(settings)
		{
			_baseUri = new Uri(settings.InstanceUri, "/api/permissions");
		}

		public bool HasUserPermission(int appInstanceID, int operationID)
		{
			var query = new Query<Permission>
			{
				Filters = new HashSet<Where>() { 
					new Where { Type = WhereOperand.Equals, Field = "appInstance.id", Values = new List<int>() { appInstanceID }},
					new Where { Type = WhereOperand.Equals, Field = "operation.id", Values = new List<int>() { operationID }}
				}
			};

			return Get(query).Any();
		}
	}
}

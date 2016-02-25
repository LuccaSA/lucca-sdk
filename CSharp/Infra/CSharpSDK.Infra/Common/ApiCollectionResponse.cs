using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Lucca.CSharpSDK.Infra.Common
{
	public class ApiCollectionResponse<TEntity>
	{
		//Http 200
		public ApiDataResponse<TEntity> Data { get; set; }

		//Http Error
		public int Status { get; set; }
		public string Message { get; set; }
		public string StackTrace { get; set; }
	}
}
